// 簡單的模擬 API 伺服器，用於測試通知系統
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;
const mockDatabase = {
    users: new Map(),
    products: new Map()
};

// 初始化模擬數據
// (已移除聊天室相關初始化)

// 設置靜態文件目錄
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// 啟用 CORS
app.use(cors({
    origin: [
        'http://localhost:8084',      // 原始端口
        'http://localhost:8090',      // 新增：當前運行端口
        'http://127.0.0.1:8084',     // IP 版本
        'http://127.0.0.1:8090',     // 新增：當前運行端口 IP 版本
        'http://localhost:8085',
        'http://localhost:8086',
        'http://localhost:8087',
        'http://localhost:8088',
        'http://127.0.0.1:8085',
        'http://127.0.0.1:8086',
        'http://127.0.0.1:8087',
        'http://127.0.0.1:8088'
    ],
    credentials: true
}));
app.use(express.json());

// 請求日誌中間件
app.use((req, res, next) => {
    console.log(`📥 ${new Date().toLocaleTimeString()} ${req.method} ${req.url}`);
    next();
});



// ================== 通知相關 API ==================

// 模擬通知資料
let notifications = [
    {
        id: 1,
        title: '系統維護公告',
        content: `
      <p>親愛的用戶您好，</p>
      <p>為了提供更好的服務品質，我們將於 <strong>2025年8月15日 凌晨2:00-6:00</strong> 進行系統維護升級。</p>
      <p>維護期間可能會影響以下功能：</p>
      <ul>
        <li>商品搜索功能</li>
        <li>購物車結帳</li>
        <li>會員登入註冊</li>
      </ul>
      <p>造成不便，敬請見諒！</p>
    `,
        createdDate: '2025-08-14T10:30:00Z',
        priority: 'high',
        publisher: '技術部門',
        isRead: false,
        category: 'maintenance'
    },
    {
        id: 2,
        title: '新功能上線通知',
        content: `
      <p>我們很高興宣布，全新的 <strong>AI 智能推薦系統</strong> 已正式上線！</p>
      <p>新功能特色：</p>
      <ul>
        <li>🎯 個人化商品推薦</li>
        <li>🔍 智能搜索建議</li>
        <li>💬 24/7 AI 購物助理</li>
      </ul>
      <p>立即體驗，讓購物變得更智慧！</p>
    `,
        createdDate: '2025-08-13T14:15:00Z',
        priority: 'medium',
        publisher: '產品團隊',
        isRead: false,
        category: 'feature'
    },
    {
        id: 3,
        title: '會員積分政策調整',
        content: `
      <p>為了回饋廣大會員的支持，我們將調整積分政策：</p>
      <p><strong>新政策亮點：</strong></p>
      <ul>
        <li>每消費 100 元可獲得 10 積分（原為 5 積分）</li>
        <li>生日月份享有雙倍積分</li>
        <li>積分永久有效，不會過期</li>
      </ul>
      <p>新政策將於 <strong>2025年9月1日</strong> 正式生效。</p>
    `,
        createdDate: '2025-08-12T09:00:00Z',
        priority: 'normal',
        publisher: '客服中心',
        isRead: true,
        category: 'policy'
    },
    {
        id: 4,
        title: '中秋節活動預告',
        content: `
      <p>🎉 中秋佳節將至，準備好迎接超值優惠了嗎？</p>
      <p><strong>活動預告：</strong></p>
      <ul>
        <li>📅 活動時間：9月15日-9月30日</li>
        <li>🎁 滿額贈禮：消費滿2000送月餅禮盒</li>
        <li>💰 折扣優惠：全館8折起</li>
      </ul>
      <p>敬請期待！</p>
    `,
        createdDate: '2025-08-11T16:20:00Z',
        priority: 'low',
        publisher: '行銷部門',
        isRead: false,
        category: 'promotion'
    }
];

// API 端點
app.get('/api/notifications', (req, res) => {
    console.log('📡 收到通知請求');
    res.json(notifications);
});

app.put('/api/notifications/:id/acknowledge', (req, res) => {
    const id = parseInt(req.params.id);
    const notification = notifications.find(n => n.id === id);

    if (notification) {
        notification.isRead = true;
        notification.acknowledgedAt = new Date().toISOString();
        console.log(`✅ 通知 ${id} 已確認`);
        res.json({ success: true, notification });
    } else {
        res.status(404).json({ success: false, error: '通知不存在' });
    }
});

// 通知統計端點
app.get('/api/notifications/stats', (req, res) => {
    console.log('📊 收到通知統計請求');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = {
        totalCount: notifications.length,
        deliveredCount: notifications.filter(n => n.isRead).length,
        failedCount: 0,
        todayCount: notifications.filter(n => {
            const createdDate = new Date(n.createdDate);
            return createdDate >= today;
        }).length,
        scheduledCount: 0,
        successRate: notifications.length > 0 ? (notifications.filter(n => n.isRead).length / notifications.length * 100).toFixed(1) : 0,
        categoryStats: {
            general: notifications.filter(n => n.category === 'general').length,
            system: notifications.filter(n => n.category === 'system').length,
            promotion: notifications.filter(n => n.category === 'promotion').length,
            announcement: notifications.filter(n => n.category === 'announcement').length,
            urgent: notifications.filter(n => n.priority === 'high').length,
            important: notifications.filter(n => n.priority === 'medium').length
        },
        statusStats: {
            unread: notifications.filter(n => !n.isRead).length,
            read: notifications.filter(n => n.isRead).length
        },
        channelStats: {
            web: notifications.length,
            email: 0,
            sms: 0
        }
    };

    res.json({
        success: true,
        data: stats,
        message: '統計資料載入成功'
    });
});

app.post('/api/notifications', (req, res) => {
    const newNotification = {
        id: Math.max(...notifications.map(n => n.id)) + 1,
        title: req.body.title,
        content: req.body.content,
        createdDate: new Date().toISOString(),
        priority: req.body.priority || 'normal',
        publisher: req.body.publisher || '系統管理員',
        isRead: false,
        category: req.body.category || 'general'
    };

    notifications.unshift(newNotification);
    console.log('➕ 新通知已建立:', newNotification.title);
    res.json({ success: true, notification: newNotification });
});

// 健康檢查端點
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 啟動服務器
app.listen(port, () => {
    console.log('🚀 模擬 API 服務器啟動成功');
    console.log(`📡 服務器地址: http://localhost:${port}`);
    console.log('� API 端點:');
    console.log('   通知系統:');
    console.log('   - GET  /api/notifications - 獲取通知列表');
    console.log('   - PUT  /api/notifications/:id/acknowledge - 確認通知');
    console.log('   - GET  /api/notifications/stats - 通知統計');
    console.log('   - POST /api/notifications - 創建通知');
    console.log('   聊天系統:');
    console.log('   - GET  /api/users/:userId - 獲取用戶資料');
    console.log('   - GET  /api/chats - 獲取聊天列表');
    console.log('   - POST /api/messages - 保存聊天訊息');
    console.log('   - GET  /api/messages/:chatRoomId - 獲取聊天歷史記錄');
    console.log('   - PATCH /api/users/:userId/status - 更新在線狀態');
    console.log('💡 提示: 這是用於測試前端系統的模擬服務器');
    console.log('');
});

// ================== 初始化模擬數據 ==================

function initializeMockData() {
    // 創建模擬會員資料
    const members = [
        {
            userId: 123,
            username: '買家小明',
            userType: 'member',
            email: 'ming@example.com',
            avatar: 'https://via.placeholder.com/40/007bff/white?text=明',
            membershipLevel: 'gold',
            totalOrders: 25,
            joinDate: '2024-01-15',
            isOnline: false,
            lastSeenTime: new Date(Date.now() - 1800000).toISOString() // 30分鐘前
        },
        {
            userId: 124,
            username: '時尚達人',
            userType: 'member',
            email: 'fashion@example.com',
            avatar: 'https://via.placeholder.com/40/007bff/white?text=時',
            membershipLevel: 'platinum',
            totalOrders: 58,
            joinDate: '2023-11-20',
            isOnline: true,
            lastSeenTime: new Date().toISOString()
        }
    ];

    // 創建模擬廠商資料
    const sellers = [
        {
            userId: 456,
            username: '時尚小店',
            userType: 'seller',
            email: 'shop@fashion.com',
            avatar: 'https://via.placeholder.com/40/28a745/white?text=店',
            shopName: '時尚小店',
            shopDescription: '專營韓系時尚服飾，品質保證',
            businessLicense: 'BL456789123',
            rating: 4.8,
            totalSales: 1250,
            verificationStatus: 'verified',
            isOnline: true,
            lastSeenTime: new Date().toISOString()
        },
        {
            userId: 789,
            username: '韓風服飾',
            userType: 'seller',
            email: 'korean@style.com',
            avatar: 'https://via.placeholder.com/40/28a745/white?text=韓',
            shopName: '韓風服飾',
            shopDescription: '正宗韓國進口服飾，跟上最新流行趨勢',
            businessLicense: 'BL789456123',
            rating: 4.6,
            totalSales: 890,
            verificationStatus: 'verified',
            isOnline: false,
            lastSeenTime: new Date(Date.now() - 3600000).toISOString() // 1小時前
        }
    ];

    // 保存用戶資料
    [...members, ...sellers].forEach(user => {
        mockDatabase.users.set(user.userId, user);
    });

    // 創建模擬聊天室
    const chatRooms = [
        {
            chatRoomId: 'member_123_seller_456',
            memberUserId: 123,
            sellerUserId: 456,
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
            updatedAt: new Date(Date.now() - 1800000).toISOString(), // 30分鐘前
            lastMessage: {
                content: '這件衣服有現貨嗎？',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                sender: 123
            },
            unreadCount: 0
        },
        {
            chatRoomId: 'member_123_seller_789',
            memberUserId: 123,
            sellerUserId: 789,
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
            updatedAt: new Date(Date.now() - 7200000).toISOString(), // 2小時前
            lastMessage: {
                content: '謝謝您的購買！',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                sender: 789
            },
            unreadCount: 2
        }
    ];

    chatRooms.forEach(room => {
        mockDatabase.chatRooms.set(room.chatRoomId, room);
    });

    // 創建模擬聊天記錄
    const sampleMessages = [
        {
            messageId: 'msg_1',
            chatRoomId: 'member_123_seller_456',
            senderId: 123,
            senderType: 'member',
            content: '您好，請問這件商品還有現貨嗎？',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            messageType: 'text'
        },
        {
            messageId: 'msg_2',
            chatRoomId: 'member_123_seller_456',
            senderId: 456,
            senderType: 'seller',
            content: '您好！這款目前還有庫存，有S、M、L三個尺寸',
            timestamp: new Date(Date.now() - 3000000).toISOString(),
            messageType: 'text'
        },
        {
            messageId: 'msg_3',
            chatRoomId: 'member_123_seller_456',
            senderId: 123,
            senderType: 'member',
            content: '請問可以看看M號的實拍照嗎？',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            messageType: 'text'
        }
    ];

    sampleMessages.forEach(msg => {
        if (!mockDatabase.messages.has(msg.chatRoomId)) {
            mockDatabase.messages.set(msg.chatRoomId, []);
        }
        mockDatabase.messages.get(msg.chatRoomId).push(msg);
    });

    console.log('✅ 模擬數據初始化完成');
    console.log(`👥 創建了 ${mockDatabase.users.size} 個用戶`);
    console.log(`💬 創建了 ${mockDatabase.chatRooms.size} 個聊天室`);
}

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n🛑 正在關閉服務器...');
    process.exit(0);
});
