type LatLng = { lat: number; lng: number }

const LAST_LOCATION_KEY = 'markit:last-location'

const getCurrentPosition = (options: PositionOptions) =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })

export const getDeviceLocation = async (): Promise<LatLng> => {
  const attempts: PositionOptions[] = [
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 },
    { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
  ]

  let lastError: any = null
  for (const options of attempts) {
    try {
      const pos = await getCurrentPosition(options)
      const value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }
      localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(value))
      return value
    } catch (error) {
      lastError = error
    }
  }

  const cached = localStorage.getItem(LAST_LOCATION_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
        return parsed
      }
    } catch {
      // ignore invalid cached value
    }
  }

  throw lastError ?? new Error('Unable to retrieve location')
}

