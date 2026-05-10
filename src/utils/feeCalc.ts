export const WAITING_RATE_PER_MIN = 1
export const DELIVERY_MIN_FEE = 30
const DELIVERY_FORWARD_RATE = 8
const DELIVERY_BACKWARD_RATE = 8

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100

export const CART_MAX_ITEMS = 10
export const CART_MAX_PER_STORE = 5

export function calculateMaxWaitingMinutes(totalItems: number): number {
  const items = Math.max(0, Math.floor(Number(totalItems) || 0))
  if (items === 0) return 0
  return 15 + Math.max(0, items - 3) * 4
}

export function calculateMaxWaitingFee(minutes: number): number {
  const m = Math.max(0, Number(minutes) || 0)
  return round2(m * WAITING_RATE_PER_MIN)
}

export function calculateDeliveryFee(opts: { forwardKm: number; backwardKm: number }): number {
  const fwd = Math.max(0, Number(opts.forwardKm) || 0)
  const bwd = Math.max(0, Number(opts.backwardKm) || 0)
  const raw = fwd * DELIVERY_FORWARD_RATE + bwd * DELIVERY_BACKWARD_RATE
  return Math.max(DELIVERY_MIN_FEE, Math.round(raw))
}
