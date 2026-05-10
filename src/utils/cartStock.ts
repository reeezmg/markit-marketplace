import { validateStock } from '@/api/api'

type CartStoreLike = {
  groups: any[]
  saveCart: () => Promise<void>
}

const normalizeSize = (size: any) =>
  size == null || size === '' ? null : String(size)

const stockKey = (variantId: string, size: any) =>
  `${variantId}::${normalizeSize(size) ?? 'nosize'}`

export function getCartQuantity(cart: CartStoreLike, variantId: string, size: any) {
  const key = stockKey(variantId, size)
  return cart.groups
    .flatMap(group => group.companies || [])
    .flatMap(company => company.items || [])
    .filter(item => stockKey(item.id, item.selectedSize) === key)
    .reduce((total, item) => total + Math.max(1, Number(item.quantity || 1)), 0)
}

export function getVariantAvailableQty(variant: any, size: any) {
  const normalizedSize = normalizeSize(size)
  const item = (variant?.items || []).find((entry: any) =>
    normalizeSize(entry.size) === normalizedSize
  )
  return Math.max(0, Number(item?.qty || 0))
}

export async function reconcileCartStock(cart: CartStoreLike) {
  const requestMap = new Map<string, {
    variantId: string
    size: string | null
    quantity: number
    label: string
  }>()

  for (const group of cart.groups || []) {
    for (const company of group.companies || []) {
      for (const item of company.items || []) {
        const key = stockKey(item.id, item.selectedSize)
        const existing = requestMap.get(key)
        const quantity = Math.max(1, Number(item.quantity || 1))
        if (existing) {
          existing.quantity += quantity
          continue
        }
        requestMap.set(key, {
          variantId: item.id,
          size: normalizeSize(item.selectedSize),
          quantity,
          label: item.productName || item.name || 'Product',
        })
      }
    }
  }

  const requests = Array.from(requestMap.values())
  if (!requests.length) return []

  const response = await validateStock(requests)
  const stockRows = response.data?.items || []
  const messages: string[] = []

  for (const row of stockRows) {
    const key = stockKey(row.variantId, row.size)
    const requested = requestMap.get(key)
    if (!requested) continue

    const availableQty = row.available ? Math.max(0, Number(row.availableQty || 0)) : 0
    if (availableQty >= requested.quantity) continue

    let remainingAllowed = availableQty
    for (const group of cart.groups || []) {
      for (const company of group.companies || []) {
        const nextItems: any[] = []
        for (const item of company.items || []) {
          if (stockKey(item.id, item.selectedSize) !== key) {
            nextItems.push(item)
            continue
          }

          const unitQty = Math.max(1, Number(item.quantity || 1))
          if (remainingAllowed >= unitQty) {
            remainingAllowed -= unitQty
            nextItems.push(item)
          }
        }
        company.items = nextItems
      }
      group.companies = (group.companies || []).filter((company: any) => company.items?.length)
    }

    const removedQty = requested.quantity - availableQty
    const sizeLabel = requested.size ? ` (${requested.size})` : ''
    messages.push(
      availableQty > 0
        ? `${requested.label}${sizeLabel}: only ${availableQty} left, removed ${removedQty}.`
        : `${requested.label}${sizeLabel} is out of stock and was removed.`
    )
  }

  cart.groups = (cart.groups || []).filter(group => group.companies?.length)
  if (messages.length) {
    await cart.saveCart()
  }

  return messages
}
