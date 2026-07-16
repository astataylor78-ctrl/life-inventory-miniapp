import { describe, expect, it } from 'vitest'
import { fromScaledQuantity, toScaledQuantity, validateStockTargets } from '@/domain/quantity'

describe('数量精度', () => {
  it('使用放大 1000 倍的整数存储', () => {
    expect(toScaledQuantity('1.125')).toBe(1125)
    expect(toScaledQuantity('0.5')).toBe(500)
  })
  it('拒绝超过三位小数和负库存', () => {
    expect(() => toScaledQuantity('1.0001')).toThrow()
    expect(() => toScaledQuantity('-1')).toThrow()
  })
  it('格式化显示数量', () => {
    expect(fromScaledQuantity(1120)).toBe('1.12')
    expect(fromScaledQuantity(1000)).toBe('1')
  })
  it('拒绝目标库存低于安全库存', () => {
    expect(() => validateStockTargets(2000, 1000)).toThrow('目标库存不能低于安全库存')
    expect(() => validateStockTargets(2000, null)).not.toThrow()
  })
})
