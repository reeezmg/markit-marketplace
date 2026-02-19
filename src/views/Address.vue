<template>
  <ion-page class="address-page">
    <Topbar title="Address" />

    <ion-content :fullscreen="true" class="ion-padding address-content">
      <List />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
} from "@ionic/vue";
import List from '@/components/Address/List.vue';
import Topbar from '@/components/Topbar.vue';


</script>

<style scoped>
.address-page {
  background: var(--markit-bg);
}

.address-content {
  --background: var(--markit-bg);
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 10px;
  --padding-bottom: calc(90px + var(--markit-bottom-inset));
}
</style>
