<template>
  <ion-page>
    <Topbar/>

    <ion-content color="light">
      <div
        v-for="trynbuy in trynbuys.tryHistoryList"
        :key="trynbuy.trynbuy_id"
        class="my-4"
      >
        <Trynbuy :trynbuy="trynbuy" />
      </div>
    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { onMounted } from 'vue'
import { IonPage, IonButtons,IonTitle, IonBackButton, IonHeader, IonContent } from '@ionic/vue'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import Trynbuy from '@/components/History/Trynbuy.vue'
import { heartOutline, heart, cartOutline } from "ionicons/icons";
import Topbar from '@/components/Topbar.vue';

const trynbuys = useTryHistoryStore()

onMounted(async () => {
  await trynbuys.loadFromStorage()
  console.log(trynbuys.tryHistoryList)
  if (!trynbuys.tryHistoryList.length) {
    await trynbuys.fetchFromApi()
  }
})
</script>
