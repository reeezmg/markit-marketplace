<template>
  <ion-modal 
  :is-open="isOpen" 
  @didDismiss="close" 
  :breakpoints="[0, 0.75, 0.9]" 
  :initial-breakpoint="0.9" 
  :handle-behavior="'cycle'"
  :can-dismiss="true" 
  :backdrop-dismiss="true" 
  show-backdrop 
  swipe-to-close>


    <ion-content class="">
      <div class="bg-[#097D4C] text-sm text-center mt-4">
        <div class="text-white">Note: Orders cannot be delivered to public spaces</div>
      </div>


        <div class="flex flex-col mt-4 ion-padding">
            <div class="text-xl font-bold mb-2">{{ name }}</div>
            <div class="text-md">{{ formattedAddress }}</div>
          </div>


      <div class="my-1 ion-padding">
  <label class="block text-sm text-gray-800 mb-2">Address Type</label>
  <div class="flex gap-3 flex-wrap">
    <ion-button
      v-for="t in types"
      size="small"
      :key="t"
      :fill="type === t ? 'solid' : 'outline'"
      :color="type === t ? 'primary' : 'medium'"
      @click="type = t"
    >
      {{ t }}
    </ion-button>
  </div>
</div>



    <div class="ion-padding">
      <ion-item  class="mb-2">
        <ion-input
          label="Flat / Floor / House number"
          label-placement="stacked"
          placeholder="e.g., 101, 1st Floor"
          v-model="houseDetails"
        ></ion-input>
      </ion-item>

      <ion-item  class="mb-2">
        <ion-input
          label="Nearby Landmark (Optional)"
          label-placement="stacked"
          placeholder="e.g., Near SBI ATM"
          v-model="landmark"
        ></ion-input>
      </ion-item>

      <!-- <ion-item  class="mb-2">
        <ion-input
          label="Receiver’s name"
          label-placement="stacked"
          v-model="receiverName"
        ></ion-input>
      </ion-item>

        <ion-item class="mb-2">
        <ion-label position="stacked">Receiver’s number</ion-label>
        <ion-input
          type="tel"
          v-model="receiverNumber"
        >
          <div slot="start" class="pr-2 text-gray-700 font-medium">+91</div>
        </ion-input>
      </ion-item> -->


      <ion-button expand="block" class="ion-margin-top" @click="submitForm">Save Address</ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { ref } from 'vue'
import {
  IonHeader,
  IonItem,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonModal
} from '@ionic/vue'
import { closeOutline, closeSharp } from 'ionicons/icons'
import { toRef } from 'vue'

const types = ['Home', 'Work', 'Friends', 'Other']

const props = defineProps({
  isOpen: Boolean,
  name: String,
  formattedAddress: String
})

const emit = defineEmits(['close', 'save'])

const close = () => {
  emit('close')
}

// Form fields
const name = toRef(props, 'name') // reactive to parent changes
const formattedAddress = toRef(props, 'formattedAddress')
const type = ref('')
const houseDetails = ref('')
const landmark = ref('')
const receiverName = ref('')
const receiverNumber = ref('')

function submitForm() {
  const data = {
    name: name.value,
    formattedAddress: formattedAddress.value,
    type: type.value,
    houseDetails: houseDetails.value,
    landmark: landmark.value,
  }
  emit('save', data)
  close()
}
</script>

