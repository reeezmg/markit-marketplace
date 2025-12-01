<template>
  <ion-item button lines="none" @click="addAddress">
    <ion-label class="text-primary font-medium">Add new address</ion-label>
  </ion-item>

  <ion-list class="mt-2">
    <ion-item
      v-for="address in store.addresses"
      :key="address.id"
      lines="none"
      class="block border-t border-gray-200 py-4"
      @click="confirmLocation(address)"
    >
      <ion-label class="ion-text-wrap">
        <h2 class="text-base font-semibold mb-1">
          {{ address.houseDetails || address.name}}
        </h2>
        <p class="text-sm text-gray-600 leading-snug">
          {{ address.formattedAddress }}
        </p>
      </ion-label>
      <ion-button
        fill="clear"
        slot="end"
        size="small"
        color="dark"
        @click.prevent.stop="editAddress(address.id)"
      >
        Edit
      </ion-button>
    </ion-item>
  </ion-list>
</template>

<script setup lang="ts">
import {
  IonItem,
  IonLabel,
  IonList,
  IonButton
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getAddresses, Address } from '@/api/address';
import { useLocationStore } from '@/composables/useLocationStore'
import { useAddressStore } from '@/store/useAddressStore';

const router = useRouter();
const route = useRoute();
const addresses = ref<Address[]>([]);
const { setLocation } = useLocationStore()
const store = useAddressStore()
const redirect = route.params.redirect;

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
    router.push(`/${redirect}`);
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
  router.push('/account/address/add/' + redirect);
};

const editAddress = (id: string) => {
  router.push('/account/address/edit/' + id + '/' + redirect);
};
</script>

<style scoped>
.text-primary {
  color: #064e3b; /* Customize as needed */
}
</style>
