import { Preferences } from '@capacitor/preferences'
import { ref } from 'vue'

const CLIENT_KEY = 'client'

export const useClient = () => {
  const client = ref(null)

  // ✅ Get client from preferences
  const getClient = async () => {
    const { value } = await Preferences.get({ key: CLIENT_KEY })
    client.value = value ? JSON.parse(value) : null
    return client.value
  }

  // ✅ Update or set client in preferences
  const setClient = async (newClient) => {
    client.value = newClient
    await Preferences.set({
      key: CLIENT_KEY,
      value: JSON.stringify(newClient)
    })
  }

  // ✅ Delete client from preferences
  const deleteClient = async () => {
    await Preferences.remove({ key: CLIENT_KEY })
    client.value = null
  }

  return {
    client,
    getClient,
    setClient,
    deleteClient,
  }
}
