// Производные метрики. Считаются на клиенте из performanceDaily.

export function safeRate(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return numerator / denominator;
}

export function calcGrowth(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null; // null => нет базы для сравнения
  return (current - previous) / previous;
}

export const calcCtr = (clicks: number, views: number) => safeRate(clicks, views);
export const calcCartRate = (addToCart: number, clicks: number) => safeRate(addToCart, clicks);
export const calcOrderConversion = (orders: number, clicks: number) => safeRate(orders, clicks);
export const calcClickToCart = (addToCart: number, clicks: number) => safeRate(addToCart, clicks);
export const calcCartToOrder = (orders: number, addToCart: number) => safeRate(orders, addToCart);
export const calcPurchaseRate = (purchasedOrders: number, orders: number) =>
  safeRate(purchasedOrders, orders);
export const calcViewToPurchase = (purchasedOrders: number, views: number) =>
  safeRate(purchasedOrders, views);
export const calcAov = (gmv: number, purchasedOrders: number) => safeRate(gmv, purchasedOrders);
export const calcCommissionRate = (commission: number, gmv: number) => safeRate(commission, gmv);
export const calcRevenuePer1000 = (commission: number, views: number) =>
  views ? (commission / views) * 1000 : 0;
export const calcGmvPer1000 = (gmv: number, views: number) =>
  views ? (gmv / views) * 1000 : 0;
