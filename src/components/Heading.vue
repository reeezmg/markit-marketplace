<template>
  <div class="flex items-center mb-2">
    <ion-text class="text-md font-semibold text-[#097D4C] pr-2">
      {{ title }}
    </ion-text>
    <div class="flex-1 h-[0.5px] bg-[#097D4C] px-2"></div>
  </div>
</template>

<script setup lang="ts">
import { IonText } from '@ionic/vue';
defineProps<{ title: string }>();
</script>
