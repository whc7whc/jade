// 額外的 API 端點，用於獲取主訂單的所有子訂單
[HttpGet("master/{masterId}/sub-orders")]
public async Task<IActionResult> GetSubOrders(int masterId)
{
    // 根據主訂單ID查找同時間同會員的所有訂單
    var mainOrder = await _context.Orders.FindAsync(masterId);
    if (mainOrder == null) return NotFound();
    
    var subOrders = await _context.Orders
        .Where(o => o.MemberId == mainOrder.MemberId && 
                   o.CreatedAt.Date == mainOrder.CreatedAt.Date &&
                   o.CreatedAt.Hour == mainOrder.CreatedAt.Hour &&
                   o.CreatedAt.Minute == mainOrder.CreatedAt.Minute)
        .Include(o => o.Sellers)
        .Include(o => o.OrderDetails)
        .ToListAsync();
    
    return Ok(subOrders);
}
