<template class="ion-padding">
  <div class="space-y-4">
      <div>
        <div class="text-lg font-semibold text-slate-900">Login</div>
        <div class="text-sm text-slate-600">Enter your phone number to continue</div>
      </div>
      <div class="mt-2">

        <!-- Unified Row -->
        <div class="flex items-center border border-gray-300 rounded-lg shadow-sm bg-white">

          <!-- Country Code Combobox -->
          <Combobox v-model="selectedCountry">
            <div class="relative w-20">
              <ComboboxInput
                class="w-full px-3 py-2 border-r border-gray-300 outline-none"
                :displayValue="(country) => country ? `${country.dial_code}` : ''"
                @input="query = $event.target.value"
                placeholder="+91"
              />
              <ComboboxOptions
                class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              >
                <ComboboxOption
                  v-for="country in filteredCountries"
                  :key="country.code"
                  :value="country"
                  class="cursor-pointer select-none px-4 py-2 hover:bg-gray-100"
                >
                  {{ country.name }} ({{ country.dial_code }})
                </ComboboxOption>
              </ComboboxOptions>
            </div>
          </Combobox>

          <!-- Phone Number Input -->
          <ion-input
            v-model="phoneNumber"
            type="tel"
            inputmode="tel"
            class="flex-1 mx-3"
          />
        </div>

        <!-- Submit -->
        <ion-button expand="block" class="mt-5 markit-cta" @click="submitOtp">
          Submit
        </ion-button>

      </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/vue'
import { IonInput, IonButton } from '@ionic/vue'
import countryCodes from '@/assets/phoneCode.json'

const emit = defineEmits(['submitClicked']) // ✅ FIXED

const phoneNumber = ref('')
const selectedCountry = ref(countryCodes.find(c => c.dial_code === '+91'))
const query = ref('')

const filteredCountries = computed(() => {
  if (!query.value) return countryCodes
  return countryCodes.filter(c =>
    c.name.toLowerCase().includes(query.value.toLowerCase()) ||
    c.dial_code.includes(query.value)
  )
})

const submitOtp = () => {
  emit('submitClicked', {
    phone: `${selectedCountry.value.dial_code}${phoneNumber.value}`
  })
}
</script>

