<!-- 
使用說明：
1. 複製下面的 JavaScript 代碼
2. 在瀏覽器中開啟 https://moonlit-klepon-a78f8c.netlify.app/cart 或 /checkout
3. 按 F12 打開控制台
4. 貼上代碼並按 Enter 執行
5. 重新刷新頁面
-->

// 設定會員14的認證
function setMember14() {
    localStorage.setItem('memberId', '14');
    localStorage.setItem('authToken', 'test-token-14');
    localStorage.setItem('currentUser', JSON.stringify({
        memberId: 14,
        email: 'ChengFeng1308@gmail.com',
        userType: 'member'
    }));
    console.log('✅ 已設定會員14認證');
    console.log('localStorage memberId:', localStorage.getItem('memberId'));
    location.reload();
}

// 設定會員29的認證
function setMember29() {
    localStorage.setItem('memberId', '29');
    localStorage.setItem('authToken', 'test-token-29');
    localStorage.setItem('currentUser', JSON.stringify({
        memberId: 29,
        email: 'test29@example.com',
        userType: 'member'
    }));
    console.log('✅ 已設定會員29認證');
    console.log('localStorage memberId:', localStorage.getItem('memberId'));
    location.reload();
}

// 測試API連接
async function testAPIs() {
    const memberId = localStorage.getItem('memberId');
    if (!memberId) {
        console.error('❌ 請先設定會員ID');
        return;
    }
    
    console.log('🔄 開始測試所有API...');
    
    // 測試購物車API
    try {
        console.log('📡 測試購物車API...');
        const cartResponse = await fetch(`/api/Carts/user/${memberId}`);
        const cartData = await cartResponse.json();
        console.log('🛒 購物車API結果:', cartData);
        
        if (cartData.success) {
            console.log('✅ 購物車API成功 - 找到', cartData.data.items?.length || 0, '件商品');
        } else {
            console.error('❌ 購物車API失敗:', cartData.message);
        }
    } catch (error) {
        console.error('❌ 購物車API錯誤:', error);
    }
    
    // 測試優惠券API
    try {
        console.log('📡 測試優惠券API...');
        const couponResponse = await fetch(`/api/Members/${memberId}/MemberCoupons`);
        const couponData = await couponResponse.json();
        console.log('🎫 優惠券API結果:', couponData);
        
        if (couponData.success) {
            console.log('✅ 優惠券API成功 - 找到', couponData.data?.length || 0, '張優惠券');
        } else {
            console.error('❌ 優惠券API失敗:', couponData.message);
        }
    } catch (error) {
        console.error('❌ 優惠券API錯誤:', error);
    }
    
    // 測試會員資料API
    try {
        console.log('📡 測試會員資料API...');
        const authResponse = await fetch(`/api/Auth/${memberId}/profile`);
        const authData = await authResponse.json();
        console.log('👤 會員資料API結果:', authData);
        
        if (authResponse.ok) {
            console.log('✅ 會員資料API成功 - 會員:', authData.name);
        } else {
            console.error('❌ 會員資料API失敗');
        }
    } catch (error) {
        console.error('❌ 會員資料API錯誤:', error);
    }
    
    console.log('🎯 API測試完成！');
}

// 檢查當前認證狀態
function checkAuthStatus() {
    console.log('📋 當前認證狀態:');
    console.log('memberId:', localStorage.getItem('memberId'));
    console.log('authToken:', localStorage.getItem('authToken'));
    console.log('currentUser:', localStorage.getItem('currentUser'));
    
    const memberId = localStorage.getItem('memberId');
    if (memberId) {
        console.log('✅ 已登入會員', memberId);
    } else {
        console.log('❌ 未登入');
    }
}

// 清除認證
function clearAuth() {
    localStorage.clear();
    console.log('🗑️ 已清除所有認證資料');
    location.reload();
}

// 顯示使用說明
console.log(`
🔧 購物車/結帳頁面調試工具

可用函數：
• setMember14() - 設定會員14認證
• setMember29() - 設定會員29認證  
• testAPIs() - 測試所有API
• checkAuthStatus() - 檢查認證狀態
• clearAuth() - 清除認證

使用方法：
1. 執行 setMember14() 或 setMember29()
2. 執行 testAPIs() 檢查API
3. 重新整理頁面查看結果

如果API都正常但頁面仍無法顯示資料，請告知！
`);

// 自動檢查當前狀態
checkAuthStatus();
