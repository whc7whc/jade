const WebSocket = require('ws');

console.log('🧪 測試修復後的 WebSocket 驗證...');

const ws = new WebSocket('ws://localhost:7188/Ws2/chatRoom');

ws.on('open', () => {
    console.log('✅ WebSocket 連線成功');

    // 測試會員登入
    console.log('🔐 測試會員驗證...');
    ws.send(JSON.stringify({
        Type: 'auth',
        userId: 'member_001',
        userType: 'member',
        username: '測試會員',
        membershipLevel: 'gold'
    }));
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());
        console.log('📨 收到訊息類型:', message.Type);

        if (message.Type === 'authSuccess') {
            console.log('✅ 驗證成功回應格式:');
            console.log('   - Type:', message.Type);
            console.log('   - User 屬性存在:', !!message.user);
            console.log('   - UserInfo 屬性存在:', !!message.userInfo);

            if (message.user) {
                console.log('   - 用戶類型:', message.user.userType);
                console.log('   - 用戶名稱:', message.user.username);
            }

            setTimeout(() => {
                console.log('🔌 測試完成，關閉連線');
                ws.close();
            }, 1000);
        }

    } catch (error) {
        console.error('❌ 解析訊息錯誤:', error.message);
    }
});

ws.on('close', () => {
    console.log('👋 測試結束');
    process.exit(0);
});

ws.on('error', (error) => {
    console.error('❌ WebSocket 錯誤:', error.message);
    process.exit(1);
});

// 10秒後超時
setTimeout(() => {
    console.log('⏰ 測試超時');
    process.exit(1);
}, 10000);
