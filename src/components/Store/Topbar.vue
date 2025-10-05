<template>
   <div class="flex justify-between items-center">
      <div>
          <ion-buttons slot="start">
              <ion-back-button default-href="/" :text="name" class="text-[#097D4C]"></ion-back-button>
          </ion-buttons>
      </div>

      <div>
         <ion-icon @click="router.push('/account')" :icon="personCircleOutline" class=" text-[#097D4C] w-8 h-8" ></ion-icon>
      </div>
    </div>
  <div class="mt-6 relative w-full">
    <div class="mt-4 relative w-full">
      <div class="flex items-center w-full px-4 py-3 rounded-xl bg-gray-100 focus-within:ring-2 ring-gray-300">
        <ion-icon :icon="searchOutline" class="text-[#097D4C] me-3 w-6 h-6"></ion-icon>
        <input
          v-model="q"
          @input="onInput"
          type="text"
          placeholder="Search..."
          class="bg-transparent w-full focus:outline-none text-base"
        />
        <button v-if="q" @click="clear" class="ms-2 text-sm">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { IonIcon, IonBackButton,IonButtons } from "@ionic/vue";
import { searchOutline } from "ionicons/icons";
import { personCircleOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

const router = useRouter();

const q = ref("");
let timer: number | null = null;

// emit search event (debounced)
const emit = defineEmits<{
  (e: "search", value: string): void;
}>();

const props = defineProps({
  name:String
})

function onInput() {
  if (timer) window.clearTimeout(timer);
  // debounce 300ms
  timer = window.setTimeout(() => {
    emit("search", q.value.trim());
  }, 300);
}

function clear() {
  q.value = "";
  if (timer) window.clearTimeout(timer);
  emit("search", "");
}
</script>
