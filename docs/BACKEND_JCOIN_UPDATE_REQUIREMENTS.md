# J幣簽到系統 - 後端修改需求

## 🎯 **修改目標**
將原本的小數點 J幣系統（0.1, 0.2, 0.3...）改為整數 J幣系統（1, 2, 3...），簡化用戶體驗。

## 📊 **新的獎勵規則**

### **7天循環獎勵表**
```
第1天: 1 J幣    (資料庫 Amount = 1)
第2天: 2 J幣    (資料庫 Amount = 2)
第3天: 3 J幣    (資料庫 Amount = 3)
第4天: 4 J幣    (資料庫 Amount = 4)
第5天: 5 J幣    (資料庫 Amount = 5)
第6天: 6 J幣    (資料庫 Amount = 6)
第7天: 10 J幣   (資料庫 Amount = 10)
第8天: 1 J幣    (重新開始循環)
```

## 🔧 **需要修改的部分**

### **1. 獎勵計算邏輯**
```csharp
// 原本的邏輯 (需要修改)
var rewards = new[]
{
    new { Day = 1, Amount = 1 },   // 原本顯示 0.1 J幣
    new { Day = 2, Amount = 2 },   // 原本顯示 0.2 J幣
    new { Day = 3, Amount = 3 },   // 原本顯示 0.3 J幣
    new { Day = 4, Amount = 4 },   // 原本顯示 0.4 J幣
    new { Day = 5, Amount = 5 },   // 原本顯示 0.5 J幣
    new { Day = 6, Amount = 6 },   // 原本顯示 0.6 J幣
    new { Day = 7, Amount = 10 }   // 原本顯示 1.0 J幣
};

// 新的邏輯 (保持不變，因為 Amount 值本身就正確)
// 不需要修改 Amount 值，只需要確保 API 回應正確
```

### **2. API 回應調整**

#### **`/api/Members/{memberId}/Checkin/Info` 端點**
```csharp
// DTO 回應格式
public class CheckinInfoResponse
{
    public int MemberId { get; set; }
    public string Today { get; set; }
    public bool SignedToday { get; set; }
    public int CheckinStreak { get; set; }
    public int TodayReward { get; set; }      // ⚠️ 確保這是顯示值 (1,2,3...10)
    public DateTime ServerTime { get; set; }
    public string Unit { get; set; } = "J幣";
    public int Scale { get; set; } = 1;       // ⚠️ 改為 1 (不再使用10倍縮放)
}
```

#### **`/api/Members/{memberId}/Checkin` 端點**
```csharp
// DTO 回應格式
public class CheckinResponse
{
    public int MemberId { get; set; }
    public bool SignedToday { get; set; }
    public int CheckinStreak { get; set; }
    public int Reward { get; set; }           // ⚠️ 確保這是顯示值 (1,2,3...10)
    public decimal BeforeBalance { get; set; }
    public decimal AfterBalance { get; set; }
    public string VerificationCode { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### **3. 關鍵修改點**

#### **選項A：移除 Scale 轉換（推薦）**
```csharp
// 在回傳 API 回應時，直接使用 Amount 值
public async Task<CheckinInfoResponse> GetCheckinInfo(int memberId)
{
    // ... 計算邏輯 ...
    
    return new CheckinInfoResponse
    {
        // ... 其他欄位 ...
        TodayReward = rewardAmount,  // 直接使用，不除以 scale
        Scale = 1                    // 設為 1，表示不需要縮放
    };
}
```

#### **選項B：保持 Scale 但調整顯示邏輯**
```csharp
// 如果要保持 10x scale 系統
public async Task<CheckinInfoResponse> GetCheckinInfo(int memberId)
{
    // ... 計算邏輯 ...
    
    return new CheckinInfoResponse
    {
        // ... 其他欄位 ...
        TodayReward = rewardAmount * 10,  // 放大 10 倍，讓前端顯示時是整數
        Scale = 10                        // 保持 scale 為 10
    };
}
```

## 🧪 **測試驗證**

### **API 測試預期結果**
```json
// GET /api/Members/11/Checkin/Info
{
  "memberId": 11,
  "today": "2025-08-22",
  "signedToday": false,
  "checkinStreak": 1,
  "todayReward": 1,          // ✅ 第1天應該是 1
  "serverTime": "2025-08-22T...",
  "unit": "J幣",
  "scale": 1                 // ✅ 新的 scale 值
}

// POST /api/Members/11/Checkin
{
  "memberId": 11,
  "signedToday": true,
  "checkinStreak": 1,
  "reward": 1,               // ✅ 第1天應該是 1
  "beforeBalance": 100.0,
  "afterBalance": 101.0,     // ✅ 增加 1 J幣
  "verificationCode": "CHK-...",
  "createdAt": "2025-08-22T..."
}
```

## 📋 **檢查清單**

- [ ] 獎勵計算邏輯確認（Amount 值無需修改）
- [ ] API 回應的 `TodayReward` 欄位正確
- [ ] API 回應的 `Reward` 欄位正確  
- [ ] `Scale` 參數調整為 1
- [ ] 資料庫 `Points_Log` 表的 `Amount` 欄位儲存邏輯確認
- [ ] 用戶餘額計算邏輯確認
- [ ] API 測試驗證

## ❓ **問題釐清**

**請確認以下問題：**

1. **資料庫 Amount 欄位**：目前儲存的 1, 2, 3, ..., 10 是否就是要顯示的 J幣數量？
2. **Scale 系統**：是否要完全移除 10x scale，改為 1x scale？
3. **用戶餘額**：用戶的總 J幣餘額是否也需要調整計算方式？

## 🎯 **預期結果**

修改完成後：
- 第1天簽到：用戶看到「獲得 1 J幣」
- 第2天簽到：用戶看到「獲得 2 J幣」  
- 第7天簽到：用戶看到「獲得 10 J幣」
- 資料庫記錄：Amount = 1, 2, 3, ..., 10
- 前端顯示：1, 2, 3, ..., 10 J幣

---
**聯絡人：前端工程師**  
**日期：2025-08-22**
