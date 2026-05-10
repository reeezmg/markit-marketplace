<template>
  <div class="address-list">
    <section class="address-intro glass-card">
      <div class="intro-copy">
        <span class="intro-kicker">Delivery location</span>
        <h1 class="intro-title">Choose where we should bring your trial bag</h1>
        <p class="intro-text">
          Saved addresses help us find nearby stores and keep checkout quick.
        </p>
      </div>

      <button type="button" class="address-add-row" @click="addAddress">
        <ion-icon :icon="addOutline" aria-hidden="true" />
        <span>Add address</span>
      </button>
    </section>

    <div class="address-cards">
      <div
        v-for="address in store.addresses"
        :key="address.id"
        class="address-card"
        :class="{ 'address-card--selected': isSelected(address) }"
        role="button"
        tabindex="0"
        @click="confirmLocation(address)"
        @keydown.enter="confirmLocation(address)"
        @keydown.space.prevent="confirmLocation(address)"
      >
        <div class="address-copy">
          <div class="address-meta-row">
            <span v-if="address.type" class="address-type-pill">
              {{ address.type }}
            </span>
            <span v-if="isSelected(address)" class="address-selected-pill">
              Selected
            </span>
          </div>

          <h2 class="address-title">
            {{ address.houseDetails || address.name }}
          </h2>
          <p class="address-text">
            {{ address.formattedAddress }}
          </p>
          <p v-if="address.landmark" class="address-landmark">
            {{ address.landmark }}
          </p>
        </div>

        <button
          type="button"
          class="edit-btn"
          aria-label="Edit address"
          @click.prevent.stop="address.id && editAddress(address.id)"
        >
          <ion-icon :icon="createOutline" aria-hidden="true" />
          <span>Edit</span>
        </button>
      </div>

      <div v-if="!store.addresses.length" class="address-empty">
        <div class="empty-icon" aria-hidden="true">
          <ion-icon :icon="locationOutline" />
        </div>
        <h2 class="empty-title">No saved addresses yet</h2>
        <p class="empty-text">Add a delivery address to discover nearby shops for Try & Buy.</p>
        <button type="button" class="empty-action" @click="addAddress">
          <ion-icon :icon="addOutline" aria-hidden="true" />
          <span>Add address</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { IonIcon, useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router'
import type { Address } from '@/api/address';
import { useLocationStore } from '@/composables/useLocationStore'
import { useAddressStore } from '@/store/useAddressStore';
import { useNearbyStore } from '@/store/useNearbyStore'
import { addOutline, createOutline, locationOutline } from 'ionicons/icons'
const nearbyStore = useNearbyStore()

const router = useIonRouter();
const route = useRoute();
const { location, setLocation, getLocation } = useLocationStore()
const store = useAddressStore()
const redirect = route.params.redirect as string | undefined;
const selectedAddressId = computed(() => location.value?.id)

function goToRedirect() {
  if (redirect === 'cart') {
    router.push({ name: 'cart' })
    return
  }
  if (redirect === 'account') {
    router.push({ name: 'account' })
    return
  }
  router.push({ name: 'shops' })
}

const confirmLocation = async (address: Address) => {
    const selectedLocation = {
      lat: address.lat ?? 0,
      lng: address.lng ?? 0,
      name: address.name ?? '',
      formattedAddress: address.formattedAddress ?? '',
      houseDetails: address.houseDetails ?? '',
      landmark: address.landmark ?? '',
      type: address.type ?? '',
      id: address.id,
      active: address.active ?? true,
    }

    await setLocation(selectedLocation)
    await nearbyStore.$reset()
    await nearbyStore.fetchNearbyShops()
    goToRedirect()
}

onMounted(async () => {
  await getLocation()
  await store.loadFromStorage()

  if (!store.addresses.length) {
    await store.fetchFromApi()
  }
})

const isSelected = (address: Address) => {
  return Boolean(address.id && selectedAddressId.value === address.id)
}

const addAddress = () => {
  router.push(
    redirect
      ? { name: 'account-address-add', params: { redirect } }
      : { name: 'account-address-add' }
  );
};

const editAddress = (id: string) => {
  router.push(
    redirect
      ? { name: 'account-address-edit', params: { addressId: id, redirect } }
      : { name: 'account-address-edit', params: { addressId: id } }
  );
};
</script>

<style scoped>
.address-list {
  display: grid;
  gap: 14px;
}

.address-intro {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.address-add-row {
  width: 100%;
  min-height: var(--markit-btn-height-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-radius: var(--markit-btn-radius);
  border: 1px solid var(--ion-color-primary);
  padding: 12px 16px;
  font-size: 0.96rem;
  line-height: 1.2;
  font-weight: 700;
  box-shadow: none;
}

.address-add-row ion-icon,
.empty-action ion-icon,
.edit-btn ion-icon {
  font-size: 18px;
}

.intro-kicker {
  display: inline-flex;
  width: fit-content;
  border-radius: var(--markit-radius-pill);
  padding: 4px 9px;
  background: color-mix(in srgb, var(--ion-color-primary) 12%, transparent);
  color: #2d5444;
  font-size: 0.72rem;
  line-height: 1;
  font-weight: 800;
}

.intro-title {
  margin: 10px 0 0;
  font-size: 1.22rem;
  line-height: 1.24;
  font-weight: 800;
  color: var(--markit-text);
}

.intro-text {
  margin: 6px 0 0;
  font-size: 0.9rem;
  line-height: 1.42;
  color: var(--markit-text-muted);
}

.address-cards {
  display: grid;
  gap: 12px;
}

.address-card {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  border: 1px solid var(--markit-border);
  background: var(--markit-surface);
  border-radius: var(--markit-radius-lg);
  padding: 14px;
  box-shadow: var(--markit-shadow-soft);
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.address-card:active {
  transform: scale(0.99);
}

.address-card--selected {
  border-color: var(--markit-glass-border-hover);
  background:
    linear-gradient(180deg, rgba(83, 129, 108, 0.08), rgba(255, 255, 255, 0.94)),
    var(--markit-surface);
}

.address-copy {
  min-width: 0;
}

.address-meta-row {
  min-height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.address-type-pill,
.address-selected-pill {
  display: inline-flex;
  align-items: center;
  border-radius: var(--markit-radius-pill);
  padding: 4px 8px;
  font-size: 0.68rem;
  line-height: 1;
  font-weight: 800;
}

.address-type-pill {
  color: var(--markit-text-muted);
  background: var(--markit-surface-muted);
  border: 1px solid var(--markit-border);
}

.address-selected-pill {
  color: #2d5444;
  background: color-mix(in srgb, var(--ion-color-primary) 13%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 24%, var(--markit-border));
}

.address-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 800;
  color: var(--markit-text);
  overflow-wrap: anywhere;
}

.address-text {
  margin: 5px 0 0;
  font-size: 0.86rem;
  line-height: 1.38;
  color: var(--markit-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.address-landmark {
  margin: 6px 0 0;
  font-size: 0.78rem;
  line-height: 1.32;
  color: #2d5444;
}

.edit-btn {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 24%, var(--markit-border));
  background: color-mix(in srgb, var(--ion-color-primary) 9%, #ffffff);
  color: var(--ion-color-primary);
  border-radius: var(--markit-btn-radius);
  padding: 8px 10px;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.address-empty {
  display: grid;
  justify-items: center;
  border: 1px dashed var(--markit-glass-border);
  border-radius: var(--markit-radius-lg);
  padding: 24px 16px;
  text-align: center;
  background: var(--markit-glass-surface);
  color: var(--markit-text-muted);
}

.empty-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #2d5444;
  background: var(--markit-glass-surface-strong);
  border: 1px solid var(--markit-glass-border);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
}

.empty-icon ion-icon {
  font-size: 22px;
}

.empty-title {
  margin: 12px 0 0;
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 800;
  color: var(--markit-text);
}

.empty-text {
  max-width: 260px;
  margin: 6px 0 0;
  font-size: 0.86rem;
  line-height: 1.4;
  color: var(--markit-text-muted);
}

.empty-action {
  min-height: var(--markit-btn-height-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  border: 1px solid var(--ion-color-primary);
  border-radius: var(--markit-btn-radius);
  padding: 10px 14px;
  background: var(--ion-color-primary);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 800;
}

@media (max-width: 360px) {
  .address-card {
    grid-template-columns: 1fr;
  }

  .edit-btn {
    grid-column: 1;
    width: fit-content;
  }
}
</style>
