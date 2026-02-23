<template>
  <div class="address-list">
    <button type="button" class="address-add-row" @click="addAddress">
      Add new address
    </button>

    <div class="address-cards">
      <div
        v-for="address in store.addresses"
        :key="address.id"
        class="address-card"
        role="button"
        tabindex="0"
        @click="confirmLocation(address)"
        @keydown.enter="confirmLocation(address)"
        @keydown.space.prevent="confirmLocation(address)"
      >
        <div class="address-copy">
          <h2 class="address-title">
            {{ address.houseDetails || address.name }}
          </h2>
          <p class="address-text">
            {{ address.formattedAddress }}
          </p>
        </div>

        <button
          type="button"
          class="edit-btn"
          @click.prevent.stop="editAddress(address.id)"
        >
          Edit
        </button>
      </div>

      <div v-if="!store.addresses.length" class="address-empty">
        No saved addresses yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router'
import type { Address } from '@/api/address';
import { useLocationStore } from '@/composables/useLocationStore'
import { useAddressStore } from '@/store/useAddressStore';
import { useNearbyStore } from '@/store/useNearbyStore'
const nearbyStore = useNearbyStore()

const router = useIonRouter();
const route = useRoute();
const { setLocation } = useLocationStore()
const store = useAddressStore()
const redirect = route.params.redirect as string | undefined;

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

const confirmLocation = async (address:Address) => {
  
    const location = {
      lat: address.lat ?? 0,
      lng: address.lng ?? 0,
      name: address.name ?? '',
      formattedAddress: address.formattedAddress ?? '',
      houseDetails: address.houseDetails ?? '',
      landmark: address.landmark ?? '',
      type: address.type ?? '',
      id: address.id,
    }

    await setLocation(location)
          await nearbyStore.$reset()
  await nearbyStore.fetchNearbyShops()
    goToRedirect()
}

// 🔹 Load addresses on mount
onMounted(async () => {
  console.log(store.addresses)
  // Try local cache first, then fallback to API if empty
  await store.loadFromStorage()
  if (!store.addresses.length) {
    await store.fetchFromApi()
  }
})

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
  gap: 10px;
}

.address-add-row {
  width: 100%;

  text-align: center;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-radius: 999px;
  padding: 14px 16px;
  font-size: 1.12rem;
  line-height: 1.2;
  font-weight: 700;
  
}

.address-cards {
  display: grid;
  gap: 10px;
}

.address-card {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  text-align: left;
  border: 1px solid var(--markit-border);
  background: var(--markit-surface);
  border-radius: var(--markit-radius-xl);
  padding: 14px 16px;
  box-shadow: var(--markit-shadow-soft);
}

.address-copy {
  min-width: 0;
}

.address-title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--markit-text);
}

.address-text {
  margin: 4px 0 0;
  font-size: 0.96rem;
  line-height: 1.35;
  color: var(--markit-text-muted);
}

.edit-btn {
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 30%, var(--markit-border));
  background: color-mix(in srgb, var(--ion-color-primary) 12%, #ffffff);
  color: var(--ion-color-primary);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.address-empty {
  border: 1px dashed var(--markit-border);
  border-radius: var(--markit-radius-xl);
  padding: 18px 14px;
  text-align: center;
  color: var(--markit-text-muted);
}

</style>
