<template>
  <ion-page>
       <ion-header class="ion-no-border ion-padding ">
      <div class="flex flex-row justify-between">
      <ion-buttons slot="start">
      <ion-back-button  text="Address"></ion-back-button>
      </ion-buttons>
      <div class="flex flex-row gap-4 justify-center">
      <button @click="$router.push('/whishlist')" class="flex flex-col items-center text-green-800">
      <ion-icon :icon="heartOutline" class="w-8 h-8"></ion-icon>
      </button>

      <button @click="$router.push('/cart')" class="flex flex-col items-center text-green-800">
      <ion-icon :icon="cartOutline" class="w-8 h-8"></ion-icon>
      </button>
      </div>
      </div>
      </ion-header>

    <ion-content class="ion-padding">

    <List/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
} from "@ionic/vue";
import List from '@/components/Address/List.vue';
import Topbar from '@/components/Topbar.vue';
import { heartOutline, heart, cartOutline } from "ionicons/icons";


</script>
