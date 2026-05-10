export type DeliveryStepEvent = {
  step: string
  action: string
  meta?: Record<string, any>
  created_at?: string
}

export type DeliveryStoreRef = {
  id?: string | null
  name?: string | null
}

const formatStatusFallback = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const getStoreNameByIndex = (stores: DeliveryStoreRef[], index?: number | null) => {
  if (index == null || Number.isNaN(Number(index))) return ''
  const hit = stores[Number(index)]
  return String(hit?.name || '').trim()
}

const getStoreNameForEvent = (event: DeliveryStepEvent, stores: DeliveryStoreRef[]) => {
  const companyId = String(event?.meta?.companyId || event?.meta?.company_id || '').trim()
  if (companyId) {
    const hit = stores.find((store) => String(store?.id || '').trim() === companyId)
    if (hit?.name) return String(hit.name).trim()
  }

  const storeIndex = event?.meta?.storeIndex
  const byIndex = getStoreNameByIndex(stores, Number.isFinite(Number(storeIndex)) ? Number(storeIndex) : null)
  if (byIndex) return byIndex

  return String(stores[0]?.name || 'Store').trim()
}

const sortEvents = (events: DeliveryStepEvent[] = []) =>
  [...events].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return aTime - bTime
  })

const getMilestoneKey = (event: DeliveryStepEvent) => {
  if (event.action !== 'complete') return null

  const companyId = String(event?.meta?.companyId || event?.meta?.company_id || '').trim()
  const storeIndex = event?.meta?.storeIndex
  const indexKey = Number.isFinite(Number(storeIndex)) ? Number(storeIndex) : null

  switch (event.step) {
    case 'Packed':
      if (companyId) return `packed:${companyId}`
      if (indexKey != null) return `packed-index:${indexKey}`
      return null
    case 'GoToPickup':
    case 'CollectOrder':
      if (companyId) return `${event.step.toLowerCase()}:${companyId}`
      if (indexKey != null) return `${event.step.toLowerCase()}:index:${indexKey}`
      return null
    case 'GoToDrop':
      return 'gotodrop'
    case 'Delivered':
      return 'delivered'
    case 'TrynbuyWaiting':
      return 'trynbuywaiting'
    default:
      return null
  }
}

const getStatusTextForEvent = (event: DeliveryStepEvent, stores: DeliveryStoreRef[]) => {
  const storeName = getStoreNameForEvent(event, stores)

  switch (event.step) {
    case 'Packed':
      return storeName ? `Packed from ${storeName}` : 'Packed'
    case 'GoToPickup':
      return storeName ? `On the way to ${storeName}` : 'On the way to store'
    case 'CollectOrder':
      if (event.action === 'enter') {
        return storeName ? `Waiting in ${storeName}` : 'Waiting in store'
      }
      return storeName ? `Picked from ${storeName}` : 'Picked from store'
    case 'GoToDrop':
      return event.action === 'complete'
        ? 'Arrived at customer location'
        : 'On the way to customer'
    case 'Delivered':
      return event.action === 'complete'
        ? 'Product delivered'
        : 'At customer location'
    case 'TrynbuyWaiting':
      return event.action === 'complete'
        ? 'Order complete'
        : 'Waiting for customers decision'
    default:
      return formatStatusFallback(event.step)
  }
}

const hasStoreReference = (event: DeliveryStepEvent) =>
  !!String(event?.meta?.companyId || event?.meta?.company_id || '').trim() ||
  Number.isFinite(Number(event?.meta?.storeIndex))

const getStoreKey = (event: DeliveryStepEvent) => {
  const companyId = String(event?.meta?.companyId || event?.meta?.company_id || '').trim()
  if (companyId) return `company:${companyId}`

  const storeIndex = event?.meta?.storeIndex
  if (Number.isFinite(Number(storeIndex))) return `index:${Number(storeIndex)}`

  return null
}

const getStoreKeysForRef = (store: DeliveryStoreRef, index: number) => {
  const keys = [`index:${index}`]
  const id = String(store?.id || '').trim()
  if (id) keys.unshift(`company:${id}`)
  return keys
}

const eventMatchesAnyKey = (event: DeliveryStepEvent, keys: string[]) => {
  const eventKey = getStoreKey(event)
  return !!eventKey && keys.includes(eventKey)
}

const getPackedStoreStatuses = (ordered: DeliveryStepEvent[], stores: DeliveryStoreRef[]) => {
  return stores
    .map((store, index) => {
      const keys = getStoreKeysForRef(store, index)
      const storeName = String(store?.name || `Store ${index + 1}`).trim()
      const packed = ordered.some(
        (event) => event.step === 'Packed' && event.action === 'complete' && eventMatchesAnyKey(event, keys)
      )
      const picked = ordered.some(
        (event) => event.step === 'CollectOrder' && event.action === 'complete' && eventMatchesAnyKey(event, keys)
      )
      return packed && !picked ? storeName : null
    })
    .filter((label): label is string => !!label)
}

export const getDeliveryStatusText = (
  events: DeliveryStepEvent[] = [],
  stores: DeliveryStoreRef[] = [],
  fallbackStatus = ''
) => {
  const ordered = sortEvents(events)
  if (!ordered.length) return formatStatusFallback(fallbackStatus) || ''

  const hasSpecificPacked = ordered.some(
    (event) => event.step === 'Packed' && event.action === 'complete' && hasStoreReference(event)
  )

  const lastMeaningful = [...ordered].reverse().find((event) => {
    if (!['Packed', 'GoToPickup', 'CollectOrder', 'GoToDrop', 'Delivered', 'TrynbuyWaiting'].includes(event.step)) {
      return false
    }
    if (event.step === 'Packed' && event.action === 'complete' && !hasStoreReference(event) && hasSpecificPacked) {
      return false
    }
    return true
  })

  return lastMeaningful ? getStatusTextForEvent(lastMeaningful, stores) : formatStatusFallback(fallbackStatus)
}

export const getDeliveryProgressState = (
  events: DeliveryStepEvent[] = [],
  stores: DeliveryStoreRef[] = [],
  packed = false,
  fallbackStatus = ''
) => {
  const ordered = sortEvents(events)
  const completed = new Set<string>()
  let statusText = formatStatusFallback(fallbackStatus) || (packed ? 'Packed' : '')
  const hasSpecificPacked = ordered.some(
    (event) => event.step === 'Packed' && event.action === 'complete' && hasStoreReference(event)
  )

  for (const event of ordered) {
    if (['Packed', 'GoToPickup', 'CollectOrder', 'GoToDrop', 'Delivered', 'TrynbuyWaiting'].includes(event.step)) {
      if (event.step === 'Packed' && event.action === 'complete' && !hasStoreReference(event) && hasSpecificPacked) {
        continue
      }
      statusText = getStatusTextForEvent(event, stores)
    }

    const milestoneKey = getMilestoneKey(event)
    if (milestoneKey) {
      completed.add(milestoneKey)
    }
  }

  if (packed && !ordered.some((event) => event.step === 'Packed' && event.action === 'complete')) {
    completed.add('packed:overall')
    if (!statusText) statusText = 'Packed'
  }

  const storeCount = Math.max(stores.length || 1, 1)
  const totalMilestones = storeCount * 3 + 3
  const progressPercent = Math.min(100, (completed.size / Math.max(totalMilestones, 1)) * 100)

  return {
    completedCount: completed.size,
    pendingCount: Math.max(0, totalMilestones - completed.size),
    progressPercent,
    statusText: statusText || 'Preparing order',
    packedStoreStatuses: getPackedStoreStatuses(ordered, stores),
  }
}
