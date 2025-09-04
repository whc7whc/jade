// 模擬 API 服務 - 當 Railway API 不可用時的後備方案
export const mockApiService = {
    // 模擬產品數據
    getMockProducts() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    name: '經典白T恤',
                    description: '100% 純棉，舒適透氣',
                    category: '上衣',
                    originalPrice: 890,
                    salePrice: 690,
                    mainImageUrl: '/images/cat-item1.jpg',
                    soldCount: 150,
                    rating: 4.5,
                    createdAt: new Date('2024-01-01').toISOString()
                },
                {
                    id: 2,
                    name: '休閒牛仔褲',
                    description: '修身剪裁，彈性佳',
                    category: '下著',
                    originalPrice: 1890,
                    salePrice: 1390,
                    mainImageUrl: '/images/cat-item2.jpg',
                    soldCount: 89,
                    rating: 4.2,
                    createdAt: new Date('2024-01-02').toISOString()
                },
                {
                    id: 3,
                    name: '運動外套',
                    description: '防風防水，適合戶外運動',
                    category: '外套',
                    originalPrice: 2890,
                    salePrice: 2190,
                    mainImageUrl: '/images/cat-item3.jpg',
                    soldCount: 76,
                    rating: 4.7,
                    createdAt: new Date('2024-01-03').toISOString()
                }
            ]
        }
    },

    // 模擬廣告數據
    getMockBanners() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    title: '春季新品上市',
                    imageUrl: '/images/banner-image-1.jpg',
                    link: '/products'
                },
                {
                    id: 2,
                    title: '限時優惠活動',
                    imageUrl: '/images/banner-image-2.jpg',
                    link: '/sale'
                }
            ]
        }
    },

    // 模擬通知數據
    getMockNotifications() {
        return {
            success: true,
            data: {
                items: [
                    {
                        id: 1,
                        title: '歡迎來到 JADE 電商平台',
                        message: '感謝您的註冊，開始探索我們的商品吧！',
                        type: 'welcome',
                        isRead: false,
                        createdAt: new Date().toISOString()
                    }
                ],
                total: 1
            }
        }
    }
}

export default mockApiService
