// Seller Identity helper - unify how we resolve current sellerId across the app
// 參考 CouponManager.vue 的流程：
// 1) 從 localStorage 取 memberId + isSeller
// 2) 調用 /api/ApplySeller/{memberId}/seller-id 取得真正 sellerId
// 3) 解析多種回應格式，成功後快取於 localStorage（透過 authService）

import authService from './authService'

function parseSellerIdFromResponsePayload(payload) {
    // payload 可能是：數字、{ success, data }, { sellerId }, { id }、或其他包裝
    if (payload == null) return null

    // 直接數字
    if (typeof payload === 'number') return payload

    // 標準 { success, data } 格式
    if (typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        const inner = payload.data
        if (typeof inner === 'number') return inner
        if (inner && typeof inner === 'object') {
            if ('sellerId' in inner && !isNaN(parseInt(inner.sellerId))) return parseInt(inner.sellerId)
            if ('id' in inner && !isNaN(parseInt(inner.id))) return parseInt(inner.id)
        }
    }

    // 其他物件格式
    if (typeof payload === 'object') {
        if ('sellerId' in payload && !isNaN(parseInt(payload.sellerId))) return parseInt(payload.sellerId)
        if ('id' in payload && !isNaN(parseInt(payload.id))) return parseInt(payload.id)
    }

    return null
}

export function getCachedSellerId() {
    const cached = localStorage.getItem('currentSellerId')
    const owner = localStorage.getItem('currentSellerId_owner')
    const memberId = localStorage.getItem('memberId')
    // 若快取擁有者與目前登入者不同，視為失效
    if (cached && owner && memberId && owner !== memberId) {
        localStorage.removeItem('currentSellerId')
        localStorage.removeItem('currentSellerId_owner')
        return null
    }
    // 舊快取沒有 owner 時，為避免跨帳號污染，若當前有 memberId 也視為失效
    if (cached && !owner && memberId) {
        localStorage.removeItem('currentSellerId')
        localStorage.removeItem('currentSellerId_owner')
        return null
    }
    return cached ? parseInt(cached) : null
}

export function clearCachedSellerId() {
    localStorage.removeItem('currentSellerId')
    localStorage.removeItem('currentSellerId_owner')
}

export async function resolveCurrentSellerId(options = {}) {
    const { forceRefresh = false, fallbackToMemberId = true } = options

    if (!forceRefresh) {
        const cached = getCachedSellerId()
        if (cached && !isNaN(cached)) return cached
    }

    const memberId = localStorage.getItem('memberId')
    const isSeller = localStorage.getItem('isSeller')

    if (!memberId) {
        console.warn('[sellerIdentity] memberId 不存在，無法解析 sellerId')
        return null
    }

    if (isSeller !== 'true') {
        console.warn('[sellerIdentity] 當前使用者不是賣家（isSeller !== "true"）')
        return null
    }

    // 呼叫 API 嘗試解析 sellerId
    try {
        const res = await fetch(`/api/ApplySeller/${memberId}/seller-id`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                ...authService.getAuthHeaders(),
            },
        })

        let payload = null
        try {
            const text = await res.text()
            if (text) {
                payload = JSON.parse(text)
            } else {
                payload = null
            }
        } catch (e) {
            console.warn('[sellerIdentity] 解析回應 JSON 失敗，嘗試以原始格式處理')
            payload = null
        }

        let sellerId = parseSellerIdFromResponsePayload(payload)

        // 有些後端可能直接回傳數字字串
        if (sellerId == null && typeof payload === 'string' && !isNaN(parseInt(payload))) {
            sellerId = parseInt(payload)
        }

        if (sellerId == null && res.ok === true && typeof payload === 'number') {
            sellerId = payload
        }

        if (sellerId != null && !isNaN(sellerId)) {
            authService.setCurrentSellerId(sellerId)
            // 標記此快取的擁有者為當前 memberId
            localStorage.setItem('currentSellerId_owner', memberId)
            return sellerId
        }
    } catch (err) {
        console.warn('[sellerIdentity] 呼叫 ApplySeller API 失敗，將採用 fallback 規則', err)
    }

    if (fallbackToMemberId) {
        const fallback = parseInt(memberId)
        if (!isNaN(fallback)) {
            authService.setCurrentSellerId(fallback)
            localStorage.setItem('currentSellerId_owner', memberId)
            return fallback
        }
    }

    return null
}

// 依商品管理邏輯：
// 1) 先透過 ApplySeller 解析 sellerId
// 2) 若解析結果為 null 或僅為 memberId（代表尚未建立正式賣家紀錄），
//    則呼叫 /api/Sellers/ensure-seller 以建立/確保賣家並取得正式 id
async function ensureBackendSellerRecord(memberId) {
    if (!memberId) return null
    try {
        const res = await fetch('/api/Sellers/ensure-seller', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...authService.getAuthHeaders(),
            },
            body: JSON.stringify({ memberId: parseInt(memberId) }),
        })

        let payload = null
        try {
            const text = await res.text()
            payload = text ? JSON.parse(text) : null
        } catch (_) {
            payload = null
        }

        const ensuredId = parseSellerIdFromResponsePayload(payload)
        if (ensuredId && !isNaN(parseInt(ensuredId))) {
            const finalId = parseInt(ensuredId)
            authService.setCurrentSellerId(finalId)
            // 標記擁有者
            localStorage.setItem('currentSellerId_owner', String(memberId))
            return finalId
        }
    } catch (e) {
        console.warn('[sellerIdentity] ensure-seller 呼叫失敗', e)
    }
    return null
}

export async function ensureSellerId(options = {}) {
    // 先用快取
    const cached = getCachedSellerId()
    if (cached && !isNaN(cached)) return cached

    // 解析（可能回傳真正 sellerId 或 fallback memberId）
    const resolved = await resolveCurrentSellerId(options)
    const memberId = localStorage.getItem('memberId')

    // 若無法解析，直接回傳（保持既有行為）
    if (resolved == null) return null

    // 若取得的是 memberId，嘗試確保後端賣家紀錄以拿到正式 id
    const asNumber = parseInt(resolved)
    const memberAsNumber = memberId ? parseInt(memberId) : NaN
    if (!isNaN(asNumber) && !isNaN(memberAsNumber) && asNumber === memberAsNumber) {
        const ensured = await ensureBackendSellerRecord(memberId)
        if (ensured && !isNaN(ensured)) {
            return ensured
        }
    }

    // 否則回傳解析結果
    return resolved
}
