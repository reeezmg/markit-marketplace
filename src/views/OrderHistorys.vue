<template>
  <ion-page>
    <Topbar title="Order History" />

    <ion-content :fullscreen="true" class="ion-padding order-history-page">
      <div class="order-history-wrap">
        <div
          v-for="trynbuy in trynbuys.tryHistoryList"
          :key="trynbuy.trynbuy_id"
          class="order-history-item"
        >
          <Trynbuy :trynbuy="trynbuy" />
        </div> 

        <div v-if="!trynbuys.tryHistoryList.length" class="order-history-empty">
          <h3>No Orders Yet</h3>
          <p>Your order history will appear here after your first checkout.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import Trynbuy from '@/components/History/Trynbuy.vue'
import Topbar from '@/components/Topbar.vue'

const trynbuys = useTryHistoryStore()

onMounted(async () => {
   await trynbuys.fetchFromApi()
  await trynbuys.loadFromStorage()
  console.log(trynbuys.tryHistoryList)
  if (!trynbuys.tryHistoryList.length) {
    await trynbuys.fetchFromApi()
  }
})
</script>

<style scoped>
.order-history-page {
  --background: var(--markit-bg);
  --padding-bottom: calc(92px + env(safe-area-inset-bottom, 0px));
}

.order-history-wrap {
  padding: 10px 0 16px;
}

.order-history-item {
  margin: 0 0 12px;
}

.order-history-empty {
  margin: 14px 12px 0;
  padding: 26px 16px;
  text-align: center;
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  background: var(--markit-surface);
  box-shadow: var(--markit-shadow-soft);
}

.order-history-empty h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--markit-text);
}

.order-history-empty p {
  margin: 8px 0 0;
  font-size: 0.88rem;
  line-height: 1.35;
  color: var(--markit-text-muted);
}
</style>
