<script setup lang="ts">
import { ref, computed } from "vue";
import {
  IonModal,
  IonContent,
  IonButton,
  IonFooter,
  IonToolbar,
} from "@ionic/vue";
import SelectSlot from "@/components/Cart/SelectSlot.vue";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close", "proceed"]);

const selectedOption = ref("");
const selectedSlot = ref<Date | null>(null);
const isSelectSlotOpen = ref(false);

const closeSelectSlot = () => {
  isSelectSlotOpen.value = false;
  close();
};

const openSelectSlot = () => {
  isSelectSlotOpen.value = true;
};

const getSelectedSlot = (slot: Date) => {
  console.log("Received selected slot:", slot);
  selectedSlot.value = slot;
  emit("proceed", { type: "later", slot});
};


const close = () => {
  emit("close");
};


const buttonText = computed(() => {
  if (!selectedOption.value) return "Select";
  if (selectedOption.value === "later") return "Select a slot";
  if (selectedOption.value === "instant") return "Proceed";
  return "Select";
});

const buttonDisabled = computed(() => {
  return selectedOption.value === "";
});

function onAction() {
  if (selectedOption.value === "instant") {
    emit("proceed", { type: "instant" });
    close();
  } else if (selectedOption.value === "later") {
    openSelectSlot();
  }
}
</script>

<template>
  <IonModal
    :is-open="isOpen"
    @didDismiss="close"
    breakpoints="[0, 1]"
    initialBreakpoint="1"
    :handle-behavior="'cycle'"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
  >
    <div class="blocks ion-padding">
      <div class="text-lg font-semibold text-center py-4">
        When should the trial bag arrive?
      </div>

      <div class="space-y-4">
        <!-- Instant Option -->
        <div
          @click="selectedOption = 'instant'"
          class="flex items-center justify-between space-x-3 rounded-lg border border-gray-300 shadow-sm p-3 cursor-pointer"
          :class="selectedOption === 'instant' ? 'border-black' : ''"
        >
          <div>
            <div class="bg-green-100 w-fit text-green-600 text-sm font-semibold px-2 py-1 rounded mr-2 mb-1">
              ⚡ Instant
            </div>
            <div class="flex items-center text-base font-medium">
              Get in 60 minutes
            </div>
            <div class="text-sm text-yellow-600 mt-1">
              Available from 9:30 AM to 8:00 PM
            </div>
          </div>

          <input
            type="radio"
            class="mt-1 h-4 w-4 text-black border-gray-400 focus:ring-black"
            value="instant"
            v-model="selectedOption"
          />
        </div>

        <!-- Schedule Later Option -->
        <div
          @click="selectedOption = 'later'"
          class="flex items-center justify-between space-x-3 rounded-lg border border-gray-300 shadow-sm p-3 cursor-pointer"
          :class="selectedOption === 'later' ? 'border-black' : ''"
        >
          <div>
            <div class="text-base font-medium">Schedule for later</div>
            <p class="text-sm text-gray-500 mt-1">
              Select your preferred day &amp; time
            </p>
          </div>
          <input
            type="radio"
            class="mt-1 h-4 w-4 text-black border-gray-400 focus:ring-black"
            value="later"
            v-model="selectedOption"
          />
        </div>

        <div class="mt-10">
          <!-- IonButton uses :disabled; style the disabled appearance with inline styles -->
        <IonButton
          :disabled="buttonDisabled"
          expand="block"
          @click="onAction"
          class="custom-disabled"
        >
          {{ buttonText }}
        </IonButton>
        </div>
      </div>
    </div>
     <SelectSlot 
      :is-open="isSelectSlotOpen"
       @close="closeSelectSlot"
       @confirm="getSelectedSlot"
    />
  </IonModal>
</template>

<style scoped>
ion-modal {
  --height: auto;
}
.custom-disabled:disabled {
  --background: #e5e7eb;   /* Tailwind gray-200 */
  --color: #9ca3af;        /* Tailwind gray-400 text */
  --border-color: #e5e7eb;
  opacity: 1 !important;   /* remove Ionic’s default faded opacity */
}
</style>
