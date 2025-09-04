// A tiny composable to retrieve current sellerId consistently
import { ref } from 'vue'
import { ensureSellerId, resolveCurrentSellerId, getCachedSellerId } from '@/services/sellerIdentityService.js'

export function useSellerId() {
    const sellerId = ref(getCachedSellerId())
    const loading = ref(false)
    const error = ref(null)

    async function refresh(options = {}) {
        loading.value = true
        error.value = null
        try {
            const id = await resolveCurrentSellerId(options)
            sellerId.value = id
            return id
        } catch (e) {
            error.value = e?.message || '解析 sellerId 失敗'
            return null
        } finally {
            loading.value = false
        }
    }

    async function ensure(options = {}) {
        loading.value = true
        error.value = null
        try {
            const id = await ensureSellerId(options)
            sellerId.value = id
            return id
        } catch (e) {
            error.value = e?.message || '取得 sellerId 失敗'
            return null
        } finally {
            loading.value = false
        }
    }

    return { sellerId, loading, error, refresh, ensure }
}
