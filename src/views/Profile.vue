<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <Topbar title="Profile" />
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding profile-page">
      <div class="profile-wrap ion-padding">
        <div class="glass-card profile-form">
          <div class="section-block">
            <div class="section-title">Name</div>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter your name"
              class="profile-native-input"
            />
          </div>

          <div class="section-divider" />

          <div class="section-block">
            <div class="section-title">Gender</div>
            <div class="gender-row">
              <button
                v-for="g in genders"
                :key="g.value"
                type="button"
                class="gender-chip"
                :class="{ 'gender-chip--active': form.gender === g.value }"
                @click="form.gender = g.value"
              >
                <ion-icon :icon="g.icon" class="gender-chip__icon" />
                <span>{{ g.label }}</span>
              </button>
            </div>
          </div>

          <div class="section-divider" />

          <div class="section-block">
            <div class="section-title">Date of Birth</div>
            <input v-model="form.dob" type="date" class="profile-native-input" />
          </div>
        </div>

        <ion-button expand="block" color="primary" class="profile-submit" @click="submit">
          Save Profile
        </ion-button>

        <ion-button
          expand="block"
          fill="outline"
          color="danger"
          class="profile-delete"
          @click="deleteAccount"
        >
          Delete Account
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonContent,
  IonButton, IonIcon, toastController
} from '@ionic/vue'
import { male, female, transgender, checkmarkCircleOutline } from 'ionicons/icons'
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
      header: 'Updated',
      message: 'Profile updated successfully',
      icon: checkmarkCircleOutline,
      duration: 1700,
      position: 'bottom',
      cssClass: 'markit-toast markit-toast-success'
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

<style scoped>
.profile-page {
  --background: var(--markit-bg);
}

.profile-wrap {
  display: grid;
  gap: 14px;
  padding-top: 12px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

.profile-form {
  padding: 14px;
  display: grid;
  gap: 12px;
}

.section-block {
  display: grid;
  gap: 8px;
}

.section-divider {
  height: 1px;
  background: color-mix(in srgb, var(--markit-glass-border) 70%, transparent);
}

.section-title {
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--markit-text-muted);
  margin-bottom: 0;
}

.profile-native-input {
  width: 100%;
  min-height: 46px;
  padding: 12px;
  font-size: 1.05rem;
  color: var(--markit-text);
  caret-color: #111111;
  border-radius: 14px;
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.profile-native-input::placeholder {
  color: var(--markit-text-muted);
  opacity: 0.8;
}

.profile-native-input:hover,
.profile-native-input:focus {
  border-color: rgba(var(--ion-color-primary-rgb), 0.55);
  box-shadow:
    0 0 0 3px rgba(var(--ion-color-primary-rgb), 0.22),
    inset 0 1px 0 var(--markit-glass-highlight);
}

.gender-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.gender-chip {
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  color: var(--markit-text);
  border-radius: var(--markit-radius-pill);
  min-height: 40px;
  padding: 8px 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.92rem;
  font-weight: 600;
}

.gender-chip__icon {
  width: 16px;
  height: 16px;
}

.gender-chip--active {
  background: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
  color: #fff;
}

.profile-submit {
  margin-top: 4px;
  min-height: 48px;
  font-weight: 700;
}

.profile-delete {
  min-height: 46px;
  font-weight: 700;
}
</style>
