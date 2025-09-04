// 簡單的模擬簽到 API 服務器
const express = require('express');
const cors = require('cors');

const app = express();
const port = 7146;

// 啟用 CORS 支援所有來源
app.use(cors());
app.use(express.json());

// 模擬的會員資料存儲（實際應該使用資料庫）
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

// 工具函數：獲取今日日期字串
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// 工具函數：獲取當前時間戳
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// 工具函數：生成驗證碼
function generateVerificationCode() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `CHK_${random}_${timestamp.toString().slice(-6)}`;
}

// 工具函數：計算簽到獎勵
function calculateReward(streak) {
    // 基礎獎勵 10 J幣，連續簽到有額外獎勵
    const baseReward = 10;
    const streakBonus = Math.min(streak - 1, 10); // 最多額外 10 J幣
    return baseReward + streakBonus;
}

// 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: getCurrentTimestamp(),
        service: 'Mock Checkin API'
    });
});

// 獲取今日簽到資訊 - 使用更直接的路由定義
app.get('/api/Members/:memberId/Checkin/GetTodayCheckinInfo', (req, res) => {
    const memberId = parseInt(req.params.memberId);
    const member = mockDatabase.members[memberId];

    console.log(`[${new Date().toLocaleString()}] 查詢會員 ${memberId} 簽到資訊`);

    if (!member) {
        console.log(`會員 ${memberId} 不存在`);
        return res.status(404).json({
            error: '會員不存在',
            memberId: memberId
        });
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
    res.json(response);
});

// 執行今日簽到
app.post('/api/Members/:memberId/Checkin/TodayCheckin', (req, res) => {
    const memberId = parseInt(req.params.memberId);
    const member = mockDatabase.members[memberId];

    console.log(`[${new Date().toLocaleString()}] 會員 ${memberId} 嘗試簽到`);

    if (!member) {
        console.log(`會員 ${memberId} 不存在`);
        return res.status(404).json({
            error: '會員不存在',
            memberId: memberId
        });
    }

    const today = getTodayString();

    // 檢查是否已經簽到
    if (member.lastCheckinDate === today) {
        console.log(`會員 ${memberId} 今日已經簽到過了`);
        return res.status(400).json({
            error: '今日已經簽到過了',
            signedToday: true,
            lastCheckinDate: member.lastCheckinDate
        });
    }

    // 執行簽到邏輯
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // 判斷是否連續簽到
    let newStreak;
    if (member.lastCheckinDate === yesterdayString) {
        // 連續簽到
        newStreak = member.checkinStreak + 1;
    } else {
        // 重新開始計算
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

    res.json(response);
});

// 簡單測試端點
app.get('/api/test', (req, res) => {
    res.json({ message: 'API 測試成功', timestamp: getCurrentTimestamp() });
});

// 獲取所有會員資料（測試用端點）
app.get('/api/Members', (req, res) => {
    res.json({
        members: mockDatabase.members,
        count: Object.keys(mockDatabase.members).length
    });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error('伺服器錯誤:', err);
    res.status(500).json({
        error: '內部伺服器錯誤',
        message: err.message
    });
});

// 404 處理 - 放在最後
app.use((req, res) => {
    console.log(`404 - 找不到路徑: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: '找不到此API端點',
        path: req.originalUrl,
        method: req.method
    });
});

// 啟動伺服器
app.listen(port, () => {
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
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n📝 正在關閉模擬 API 伺服器...');
    process.exit(0);
});
