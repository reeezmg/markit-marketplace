<template>
  <ion-page>
    <ion-header>
      <Topbar/>
    </ion-header>

    <ion-content>
      <!-- Name -->
      <div class="my-4">
        <ion-item>
          <ion-input v-model="form.name" label="Name" label-placement="stacked" placeholder="Enter Your Name"/>
        </ion-item>
      </div>

      <!-- Gender -->
      <div class="mb-4 ion-padding">
        <label class="block text-sm text-gray-800 mb-2">Gender</label>
        <div class="flex gap-3">
          <ion-button
            v-for="g in genders"
            :key="g.value"
            :fill="form.gender === g.value ? 'solid' : 'outline'"
            :color="form.gender === g.value ? 'primary' : 'medium'"
            @click="form.gender = g.value"
          >
            <ion-icon :icon="g.icon" slot="start" />
            {{ g.label }}
          </ion-button>
        </div>
      </div>

      <!-- DOB -->
      <div class="mb-6">
        <ion-item>
          <ion-input v-model="form.dob" type="date" label="DOB" label-placement="stacked"/>
        </ion-item>
      </div>

      <!-- Submit -->
      <ion-button expand="block" color="primary" class="ion-padding" @click="submit">
        Submit
      </ion-button>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="text-center mt-10 text-red-600 text-sm border-t py-2">
        <ion-button fill="clear" color="danger" @click="deleteAccount">
          Delete Account
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonItem, IonContent, IonInput,
  IonButton, IonFooter, IonIcon, toastController
} from '@ionic/vue'
import { male, female, transgender } from 'ionicons/icons'
import { reactive, onMounted } from 'vue'
import Topbar from '@/components/Topbar.vue'
import { useProfileStore } from '@/store/useProfileStore'   // 👈 Pinia store

// Access the Pinia store
const profileStore = useProfileStore()

const form = reactive({
  name: '',
  gender: '',
  dob: ''
})

const genders = [
  { label: 'Male', value: 'male', icon: male },
  { label: 'Female', value: 'female', icon: female },
  { label: 'Other', value: 'other', icon: transgender }
]

// Load profile when page mounts
onMounted(async () => {
  try {
    // Load cached profile first (instant display)
    await profileStore.loadFromStorage()

    if (profileStore.profile) {
      form.name   = profileStore.profile.name
      form.gender = profileStore.profile.gender ?? ''
      form.dob    = profileStore.profile.dob ? profileStore.profile.dob.split('T')[0] : ''
    }

    // Fetch latest profile from API and update local cache
    await profileStore.fetchFromApi()

    if (profileStore.profile) {
      form.name   = profileStore.profile.name
      form.gender = profileStore.profile.gender ?? ''
      form.dob    = profileStore.profile.dob ? profileStore.profile.dob.split('T')[0] : ''
    }
  } catch (err) {
    console.error('Failed to load profile:', err)
  }
})

const submit = async () => {
  try {
    await profileStore.edit({
      name: form.name,
      gender: form.gender,
      dob: form.dob || null
    })
    const toast = await toastController.create({
      message: 'Profile updated successfully',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    })
    await toast.present()
  } catch (err) {
    console.error('Error updating profile:', err)
    const toast = await toastController.create({
      message: 'Failed to update profile',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    })
    await toast.present()
  }
}

const deleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account?')) return
  try {
    await profileStore.remove()
    const toast = await toastController.create({
      message: 'Account marked as deleted',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    })
    await toast.present()
    // Optionally redirect to login page here
  } catch (err) {
    console.error('Error deleting account:', err)
    const toast = await toastController.create({
      message: 'Failed to delete account',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    })
    await toast.present()
  }
}
</script>
