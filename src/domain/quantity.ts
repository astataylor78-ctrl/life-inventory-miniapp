export const QUANTITY_SCALE = 1000

export function toScaledQuantity(value: string | number): number {
  const text = String(value).trim()
  if (!/^\d+(\.\d{1,3})?$/.test(text)) throw new Error('数量最多保留 3 位小数')
  const scaled = Math.round(Number(text) * QUANTITY_SCALE)
  if (!Number.isSafeInteger(scaled) || scaled < 0) throw new Error('数量必须大于或等于 0')
  return scaled
}

export function fromScaledQuantity(value: number): string {
  return (value / QUANTITY_SCALE).toFixed(3).replace(/\.?0+$/, '')
}

export function validateStockTargets(min: number, target: number | null): void {
  if (target !== null && target < min) throw new Error('目标库存不能低于安全库存')
}
