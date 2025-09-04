# 🚀 聊天系統正式版部署指南

## ✅ 已完成的調整

### 1. 移除測試功能
- ✅ 移除聊天測試頁面 (`/chat-test`, `/chat-test2`)
- ✅ 移除測試組件 (`AuthTestPanel`, `ChatTestView*`)
- ✅ 移除測試路由配置
- ✅ 移除測試用戶認證邏輯
- ✅ 備份測試用伺服器文件

### 2. 聊天功能整合
- ✅ 聊天功能已整合到主要的 AppHeader 導航中
- ✅ VendorChatList 組件已配置為從登入狀態自動獲取用戶資訊
- ✅ 移除硬編碼的測試數據

### 3. 後端連接配置
- ✅ API 代理：`https://localhost:7106`
- ✅ WebSocket：`wss://localhost:7106/Ws2/chatRoom`

## 🔧 需要完成的後端配置

### 1. WebSocket 聊天服務
確保您的後端 `https://localhost:7106` 提供以下 WebSocket 端點：
```
wss://localhost:7106/Ws2/chatRoom
```

#### WebSocket 訊息格式：
```json
// 用戶認證
{
  "Type": "auth",
  "userId": 123,
  "username": "使用者名稱",
  "userType": "member|seller",
  "avatar": "頭像URL"
}

// 發送私人訊息
{
  "Type": "privateMessage",
  "chatRoomId": "聊天室ID",
  "content": {
    "type": "text",
    "text": "訊息內容"
  }
}

// 獲取聊天列表
{
  "Type": "getChatList",
  "userId": 123
}
```

### 2. HTTP API 端點
確保以下 API 端點可用：

#### 用戶相關
- `GET /api/users/{userId}` - 獲取用戶資料
- `PATCH /api/users/{userId}/status` - 更新在線狀態

#### 聊天相關
- `GET /api/chats?userId={userId}&userType={userType}` - 獲取聊天列表
- `POST /api/messages` - 保存聊天訊息
- `GET /api/messages/{chatRoomId}` - 獲取聊天歷史

#### 通知相關
- `GET /api/notifications` - 獲取通知列表
- `PUT /api/notifications/{id}/acknowledge` - 確認通知

## 👤 用戶認證整合

### 當前配置
VendorChatList 組件會嘗試從以下來源獲取用戶資訊：

1. **localStorage**: `localStorage.getItem('currentUser')`
2. **Vuex Store**: `this.$store.getters['auth/currentUser']` (註解中)
3. **認證服務**: `authService.getCurrentUser()` (註解中)

### 需要調整的地方
根據您的認證系統，請修改 `VendorChatList.vue` 中的 `getCurrentUserFromAuth()` 方法：

```javascript
getCurrentUserFromAuth() {
  // 根據您的認證系統實現
  
  // 例如：從 Vuex store 獲取
  return this.$store.getters['auth/currentUser'];
  
  // 或從認證服務獲取
  // return this.$auth.user;
  
  // 或從 localStorage 獲取
  // return JSON.parse(localStorage.getItem('user'));
}
```

### 預期的用戶資料格式
```javascript
{
  userId: 123,
  username: "使用者名稱",
  userType: "member|seller", // 必須
  avatar: "頭像URL",
  email: "email@example.com",
  
  // 會員額外資料
  membershipLevel: "金卡|白金|黑卡",
  totalOrders: 25,
  
  // 賣家額外資料
  shopName: "店舖名稱",
  rating: 4.8,
  verificationStatus: "verified|pending|rejected"
}
```

## 🎯 使用方式

### 前端使用
1. 用戶登入後，點擊導航列的聊天圖示
2. 系統自動從登入狀態獲取用戶資訊
3. 建立 WebSocket 連接到後端
4. 顯示聊天列表並開始聊天

### 觸發聊天（程式化）
在商品頁面或其他地方，可以透過事件總線觸發聊天：

```javascript
// 觸發與特定賣家的聊天
this.$eventBus.emit('openVendorChat', {
  chatRoomId: `member_${買家ID}_seller_${賣家ID}`,
  participant: {
    userId: 賣家ID,
    userType: 'seller',
    username: '賣家名稱',
    avatar: '賣家頭像URL'
  }
});
```

## 🐛 除錯和監控

### 檢查清單
- [ ] 後端 WebSocket 服務正常運行
- [ ] 前端能成功建立 WebSocket 連接
- [ ] 用戶認證資料正確獲取
- [ ] API 端點返回正確的資料格式
- [ ] 聊天訊息能正常發送和接收

### 常見問題
1. **WebSocket 連接失敗**: 檢查後端 WebSocket 服務和 SSL 憑證
2. **無法獲取用戶資料**: 檢查 `getCurrentUserFromAuth()` 方法實現
3. **聊天列表為空**: 檢查 `/api/chats` API 端點
4. **訊息無法發送**: 檢查 WebSocket 訊息格式和後端處理邏輯

## 📝 下一步

1. **配置後端 WebSocket 服務**
2. **實現用戶認證整合**
3. **測試聊天功能**
4. **監控和優化效能**

---

**注意**: 測試用的 Mock API 和 WebSocket 服務器文件已備份為 `.backup` 文件，如需要可以恢復使用。
