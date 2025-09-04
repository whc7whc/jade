-- 簽到系統測試 SQL 腳本
-- 用於測試連續簽到功能

-- ========================================
-- 1. 查看會員 11 的當前簽到狀態
-- ========================================

-- 查看會員基本資訊
SELECT * FROM Members WHERE Id = 11;

-- 查看會員點數餘額
SELECT * FROM Member_Stats WHERE Member_Id = 11;

-- 查看所有簽到記錄
SELECT * FROM Points_Log 
WHERE Member_Id = 11 AND Type = 'signin' 
ORDER BY Created_At DESC;

-- ========================================
-- 2. 清除今日簽到記錄 (重置測試)
-- ========================================

-- 刪除今日簽到記錄
DELETE FROM Points_Log 
WHERE Member_Id = 11 
  AND Type = 'signin' 
  AND CAST(Created_At AS DATE) = CAST(GETDATE() AS DATE);

-- ========================================
-- 3. 設置昨天簽到記錄 (測試連續簽到)
-- ========================================

-- 插入昨天的簽到記錄
INSERT INTO Points_Log (
    Member_Id, 
    Type, 
    Amount, 
    Description, 
    Created_At,
    Verification_Code
) VALUES (
    11,
    'signin',
    1,  -- 0.1 J幣 (顯示時除以10)
    '每日簽到獎勵',
    DATEADD(day, -1, GETDATE()),  -- 昨天
    'CHK-' + FORMAT(DATEADD(day, -1, GETDATE()), 'yyyyMMdd') + '-11'
);

-- ========================================
-- 4. 設置連續多天簽到記錄 (測試7天循環)
-- ========================================

-- 清除所有舊的簽到記錄
DELETE FROM Points_Log WHERE Member_Id = 11 AND Type = 'signin';

-- 插入連續7天的簽到記錄 (測試完整循環)
DECLARE @i INT = 1;
WHILE @i <= 7
BEGIN
    DECLARE @checkinDate DATE = DATEADD(day, -@i, GETDATE());
    DECLARE @amount INT = @i;  -- 第1天=1(0.1), 第2天=2(0.2), ..., 第7天=7(0.7)
    
    INSERT INTO Points_Log (
        Member_Id,
        Type,
        Amount,
        Description,
        Created_At,
        Verification_Code
    ) VALUES (
        11,
        'signin',
        @amount,
        '每日簽到獎勵',
        @checkinDate,
        'CHK-' + FORMAT(@checkinDate, 'yyyyMMdd') + '-11'
    );
    
    SET @i = @i + 1;
END;

-- ========================================
-- 5. 驗證連續簽到天數計算
-- ========================================

-- 查看最近的簽到記錄
SELECT 
    CAST(Created_At AS DATE) as CheckinDate,
    Amount,
    CAST(Amount / 10.0 AS DECIMAL(10,1)) as DisplayAmount,
    Description,
    Verification_Code,
    Created_At
FROM Points_Log 
WHERE Member_Id = 11 AND Type = 'signin'
ORDER BY Created_At DESC;

-- 計算連續簽到天數 (模擬後端邏輯)
WITH ConsecutiveDays AS (
    SELECT 
        CAST(Created_At AS DATE) as CheckinDate,
        ROW_NUMBER() OVER (ORDER BY CAST(Created_At AS DATE) DESC) as RowNum,
        DATEDIFF(day, CAST(Created_At AS DATE), CAST(GETDATE() AS DATE)) as DaysAgo
    FROM Points_Log 
    WHERE Member_Id = 11 AND Type = 'signin'
      AND CAST(Created_At AS DATE) >= DATEADD(day, -60, GETDATE())  -- 最近60天
)
SELECT 
    CheckinDate,
    DaysAgo,
    CASE 
        WHEN DaysAgo = RowNum THEN 'Consecutive'
        ELSE 'Broken'
    END as StreakStatus
FROM ConsecutiveDays
ORDER BY CheckinDate DESC;

-- ========================================
-- 6. 更新會員餘額 (如果需要)
-- ========================================

-- 計算所有簽到獲得的總點數
DECLARE @totalSigninPoints INT = (
    SELECT ISNULL(SUM(Amount), 0) 
    FROM Points_Log 
    WHERE Member_Id = 11 AND Type = 'signin'
);

-- 更新會員總餘額 (如果需要重新計算)
UPDATE Member_Stats 
SET Total_Points = @totalSigninPoints + (
    SELECT ISNULL(SUM(CASE WHEN Type IN ('earned', 'refund') THEN Amount ELSE -Amount END), 0)
    FROM Points_Log 
    WHERE Member_Id = 11 AND Type != 'signin'
)
WHERE Member_Id = 11;

-- ========================================
-- 7. 測試腳本使用說明
-- ========================================

/*
使用方法：

1. 測試重新簽到：
   - 執行第2段 (清除今日簽到記錄)
   - 再次調用簽到 API

2. 測試連續簽到：
   - 執行第2段 (清除今日簽到記錄)
   - 執行第3段 (設置昨天簽到記錄)
   - 調用簽到 API，應該顯示連續第2天

3. 測試7天循環：
   - 執行第4段 (設置連續7天記錄)
   - 調用簽到 API，應該顯示連續第8天，獎勵重新從0.1開始

4. 驗證結果：
   - 執行第5段查看記錄
   - 檢查連續天數計算是否正確

注意事項：
- 請在測試環境中使用，不要在生產環境執行
- 執行前請備份重要資料
- Amount 欄位存儲的是整數，顯示時需要除以10
*/

-- ========================================
-- 8. 快速重置測試環境
-- ========================================

-- 完全重置會員11的簽到資料
/*
DELETE FROM Points_Log WHERE Member_Id = 11 AND Type = 'signin';
UPDATE Member_Stats SET Total_Points = 0 WHERE Member_Id = 11;
*/
