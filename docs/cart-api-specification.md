# 購物車 API 設計文件

## API 基本資訊
- **Base URL**: `https://localhost:7000/api`
- **認證方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

---

## 📋 API 端點列表

### 1. 取得購物車 `GET /api/carts`

**描述**: 取得當前用戶的購物車內容

**Headers**:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response (200)**:
```json
{
  "cartId": 1,
  "items": [
    {
      "itemId": 1,
      "productId": 1,
      "productName": "iPhone 15 Pro",
      "productImage": "https://example.com/images/iphone15pro.jpg",
      "sku": "IPH15P-256-BLK",
      "attributeValues": "Color: Black, Storage: 256GB",
      "price": 35900,
      "originalPrice": 37900,
      "quantity": 1,
      "subtotal": 35900,
      "stock": 50,
      "attributeValueId": 1
    }
  ],
  "subtotal": 35900,
  "total": 35900
}
```

---

### 2. 添加商品到購物車 `POST /api/carts`

**描述**: 將商品加入購物車

**Request Body**:
```json
{
  "productId": 1,
  "attributeValueId": 1,
  "quantity": 1
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "商品已加入購物車",
  "data": {
    "itemId": 1,
    "cartId": 1,
    "productId": 1,
    "quantity": 1,
    "subtotal": 35900
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "庫存不足",
  "errors": {
    "quantity": ["請求數量超過庫存"]
  }
}
```

---

### 3. 更新購物車商品數量 `PUT /api/carts/{itemId}`

**描述**: 更新購物車中指定商品的數量

**Path Parameters**:
- `itemId` (int): 購物車項目 ID

**Request Body**:
```json
{
  "quantity": 2
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "數量已更新",
  "data": {
    "itemId": 1,
    "quantity": 2,
    "subtotal": 71800
  }
}
```

---

### 4. 移除購物車商品 `DELETE /api/carts/{itemId}`

**描述**: 從購物車中移除指定商品

**Path Parameters**:
- `itemId` (int): 購物車項目 ID

**Response (204)**:
```
No Content
```

---

### 5. 清空購物車 `DELETE /api/carts`

**描述**: 清空當前用戶的整個購物車

**Response (204)**:
```
No Content
```

---

## 🏗️ 後端實作建議

### Controller 結構
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize] // 需要登入
public class CartsController : ControllerBase
{
    private readonly ICartService _cartService;
    
    public CartsController(ICartService cartService)
    {
        _cartService = cartService;
    }
    
    [HttpGet]
    public async Task<ActionResult<CartDto>> GetCart()
    {
        var userId = GetCurrentUserId(); // 從 JWT 取得用戶 ID
        var cart = await _cartService.GetCartAsync(userId);
        return Ok(cart);
    }
    
    // ... 其他方法
}
```

### Service 介面
```csharp
public interface ICartService
{
    Task<CartDto> GetCartAsync(int userId);
    Task<CartItemDto> AddToCartAsync(int userId, AddCartItemDto dto);
    Task<CartItemDto> UpdateCartItemAsync(int userId, int itemId, UpdateCartItemDto dto);
    Task RemoveCartItemAsync(int userId, int itemId);
    Task ClearCartAsync(int userId);
}
```

### DTO 類別
```csharp
public class CartDto
{
    public int CartId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal Total { get; set; }
}

public class CartItemDto
{
    public int ItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string ProductImage { get; set; }
    public string Sku { get; set; }
    public string AttributeValues { get; set; }
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public int Stock { get; set; }
    public int AttributeValueId { get; set; }
}

public class AddCartItemDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    public int AttributeValueId { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "數量必須大於 0")]
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "數量必須大於 0")]
    public int Quantity { get; set; }
}
```

---

## 🗄️ 資料庫查詢邏輯

### 取得購物車內容的 SQL 邏輯
```sql
SELECT 
    ci.Id as ItemId,
    ci.Product_Id as ProductId,
    p.Name as ProductName,
    pi.Image_Url as ProductImage,
    pav.Sku,
    -- 組合屬性值字串
    STRING_AGG(CONCAT(a.Name, ': ', av.Value), ', ') as AttributeValues,
    ci.Price_At_Added as Price,
    p.Price as OriginalPrice,
    ci.Quantity,
    (ci.Price_At_Added * ci.Quantity) as Subtotal,
    pav.Stock,
    ci.Attribute_Value_Id as AttributeValueId
FROM Cart_Items ci
INNER JOIN Carts c ON ci.Cart_Id = c.Id
INNER JOIN Products p ON ci.Product_Id = p.Id
INNER JOIN Product_Attribute_Values pav ON ci.Attribute_Value_Id = pav.Id
LEFT JOIN Product_Images pi ON p.Id = pi.Product_Id AND pi.Is_Primary = 1
LEFT JOIN Attribute_Values av ON pav.Attribute_Value_Id = av.Id
LEFT JOIN Attributes a ON av.Attribute_Id = a.Id
WHERE c.Member_Id = @UserId
GROUP BY ci.Id, ci.Product_Id, p.Name, pi.Image_Url, pav.Sku, 
         ci.Price_At_Added, p.Price, ci.Quantity, pav.Stock, ci.Attribute_Value_Id
```

---

## 🔧 注意事項

### 1. 安全性
- 所有 API 都需要認證
- 確保用戶只能操作自己的購物車
- 驗證商品庫存

### 2. 資料驗證
- 檢查商品是否存在且可購買
- 驗證數量不超過庫存
- 檢查屬性值是否有效

### 3. 錯誤處理
- 統一的錯誤回應格式
- 適當的 HTTP 狀態碼
- 詳細的錯誤訊息

### 4. 效能考量
- 使用適當的資料庫索引
- 考慮快取常用資料
- 批量操作優化

---

## 🧪 測試範例

### 使用 Swagger 測試
```bash
# 1. 取得購物車
GET /api/carts
Authorization: Bearer your_jwt_token

# 2. 添加商品
POST /api/carts
{
  "productId": 1,
  "attributeValueId": 1,
  "quantity": 2
}

# 3. 更新數量
PUT /api/carts/1
{
  "quantity": 3
}

# 4. 移除商品
DELETE /api/carts/1
```

### 使用 Postman Collection
可以建立 Postman collection 包含所有 API 測試案例。
