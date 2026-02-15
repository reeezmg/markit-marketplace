<template>
  <div class="heading-row">
    <ion-text class="heading-title">
      {{ title }}
    </ion-text>
    <div class="heading-rule"></div>
  </div>
</template>

<script setup lang="ts">
import { IonText } from '@ionic/vue';
defineProps<{ title: string }>();
</script>

<style scoped>
.heading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.heading-title {
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--markit-text);
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.heading-rule {
  flex: 1;
  height: 1px;
  background: var(--markit-border-strong);
}
</style>
