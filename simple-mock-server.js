// 使用內建 HTTP 模組的簡單模擬簽到 API 伺服器
const http = require('http');
const url = require('url');

const port = 7146;

// 模擬的會員資料存儲
const mockDatabase = {
    members: {
        1: {
            id: 1,
            name: '測試會員1',
            balance: 150,
            checkinStreak: 5,
            lastCheckinDate: null
        },
        2: {
            id: 2,
            name: '測試會員2',
            balance: 200,
            checkinStreak: 2,
            lastCheckinDate: '2025-08-21'
        }
    }
};

// 工具函數
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getCurrentTimestamp() {
    return new Date().toISOString();
}

function generateVerificationCode() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `CHK_${random}_${timestamp.toString().slice(-6)}`;
}

function calculateReward(streak) {
    const baseReward = 10;
    const streakBonus = Math.min(streak - 1, 10);
    return baseReward + streakBonus;
}

// 設定 CORS 標頭
function setCORSHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// 發送 JSON 回應
function sendJSONResponse(res, statusCode, data) {
    setCORSHeaders(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

// 解析請求體
function parseRequestBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = body ? JSON.parse(body) : {};
            callback(null, data);
        } catch (error) {
            callback(error, null);
        }
    });
}

// 主要伺服器邏輯
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`[${new Date().toLocaleString()}] ${method} ${pathname}`);

    // 處理 OPTIONS 請求 (CORS 預檢)
    if (method === 'OPTIONS') {
        setCORSHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }

    // 健康檢查端點
    if (pathname === '/api/health' && method === 'GET') {
        sendJSONResponse(res, 200, {
            status: 'ok',
            timestamp: getCurrentTimestamp(),
            service: 'Mock Checkin API'
        });
        return;
    }

    // 簡單測試端點
    if (pathname === '/api/test' && method === 'GET') {
        sendJSONResponse(res, 200, {
            message: 'API 測試成功',
            timestamp: getCurrentTimestamp()
        });
        return;
    }

    // 查詢簽到資訊端點
    const getCheckinInfoPattern = /^\/api\/Members\/(\d+)\/Checkin\/GetTodayCheckinInfo$/;
    const getCheckinInfoMatch = pathname.match(getCheckinInfoPattern);

    if (getCheckinInfoMatch && method === 'GET') {
        const memberId = parseInt(getCheckinInfoMatch[1]);
        const member = mockDatabase.members[memberId];

        console.log(`查詢會員 ${memberId} 簽到資訊`);

        if (!member) {
            console.log(`會員 ${memberId} 不存在`);
            sendJSONResponse(res, 404, {
                error: '會員不存在',
                memberId: memberId
            });
            return;
        }

        const today = getTodayString();
        const signedToday = member.lastCheckinDate === today;
        const todayReward = calculateReward(member.checkinStreak + (signedToday ? 0 : 1));

        const response = {
            memberId: member.id,
            today: today,
            signedToday: signedToday,
            checkinStreak: member.checkinStreak,
            todayReward: todayReward,
            serverTime: getCurrentTimestamp(),
            unit: 'J幣',
            scale: 1
        };

        console.log('簽到資訊查詢結果:', response);
        sendJSONResponse(res, 200, response);
        return;
    }

    // 執行簽到端點
    const todayCheckinPattern = /^\/api\/Members\/(\d+)\/Checkin\/TodayCheckin$/;
    const todayCheckinMatch = pathname.match(todayCheckinPattern);

    if (todayCheckinMatch && method === 'POST') {
        const memberId = parseInt(todayCheckinMatch[1]);
        const member = mockDatabase.members[memberId];

        console.log(`會員 ${memberId} 嘗試簽到`);

        if (!member) {
            console.log(`會員 ${memberId} 不存在`);
            sendJSONResponse(res, 404, {
                error: '會員不存在',
                memberId: memberId
            });
            return;
        }

        const today = getTodayString();

        // 檢查是否已經簽到
        if (member.lastCheckinDate === today) {
            console.log(`會員 ${memberId} 今日已經簽到過了`);
            sendJSONResponse(res, 400, {
                error: '今日已經簽到過了',
                signedToday: true,
                lastCheckinDate: member.lastCheckinDate
            });
            return;
        }

        // 執行簽到邏輯
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        let newStreak;
        if (member.lastCheckinDate === yesterdayString) {
            newStreak = member.checkinStreak + 1;
        } else {
            newStreak = 1;
        }

        const reward = calculateReward(newStreak);
        const beforeBalance = member.balance;
        const afterBalance = beforeBalance + reward;

        // 更新會員資料
        member.checkinStreak = newStreak;
        member.lastCheckinDate = today;
        member.balance = afterBalance;

        const response = {
            success: true,
            reward: reward,
            beforeBalance: beforeBalance,
            afterBalance: afterBalance,
            verificationCode: generateVerificationCode()
        };

        console.log('簽到成功:', response);
        console.log('更新後的會員資料:', member);

        sendJSONResponse(res, 200, response);
        return;
    }

    // 查看所有會員端點
    if (pathname === '/api/Members' && method === 'GET') {
        sendJSONResponse(res, 200, {
            members: mockDatabase.members,
            count: Object.keys(mockDatabase.members).length
        });
        return;
    }

    // 404 - 找不到端點
    console.log(`404 - 找不到路徑: ${method} ${pathname}`);
    sendJSONResponse(res, 404, {
        error: '找不到此API端點',
        path: pathname,
        method: method
    });
});

// 啟動伺服器
server.listen(port, () => {
    console.log(`\n🚀 模擬簽到 API 伺服器已啟動`);
    console.log(`📍 位址: http://localhost:${port}`);
    console.log(`📋 可用端點:`);
    console.log(`   GET  /api/health - 健康檢查`);
    console.log(`   GET  /api/test - 簡單測試`);
    console.log(`   GET  /api/Members/:id/Checkin/GetTodayCheckinInfo - 查詢簽到資訊`);
    console.log(`   POST /api/Members/:id/Checkin/TodayCheckin - 執行簽到`);
    console.log(`   GET  /api/Members - 查看所有會員`);
    console.log(`\n💡 測試建議:`);
    console.log(`   1. 使用會員 ID 1 或 2 進行測試`);
    console.log(`   2. 會員 1 尚未簽到，會員 2 昨天已簽到`);
    console.log(`   3. 連續簽到會有獎勵加成`);
    console.log(`\n📊 初始資料:`);
    Object.values(mockDatabase.members).forEach(member => {
        console.log(`   會員 ${member.id}: 餘額 ${member.balance} J幣, 連續 ${member.checkinStreak} 天, 最後簽到: ${member.lastCheckinDate || '從未'}`);
    });
    console.log(`\n🔄 使用 Ctrl+C 停止伺服器\n`);
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n📝 正在關閉模擬 API 伺服器...');
    server.close(() => {
        console.log('伺服器已關閉');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n📝 正在關閉模擬 API 伺服器...');
    server.close(() => {
        console.log('伺服器已關閉');
        process.exit(0);
    });
});
