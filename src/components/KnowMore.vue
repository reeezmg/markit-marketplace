<template>
  <IonModal
    :is-open="isOpen"
    @didDismiss="close"
    breakpoints="[0, 1]"
    initial-breakpoint="1"
    handle-behavior="cycle"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
    class="markit-filter-sheet"
  >
      <div class="knowmore-sheet">
        <div class="km-hero">
          <h2 class="km-title text-gray-700">Trial room at home in 60 mins</h2>
          <p class="km-sub text-gray-700">Try first, pay only for what you keep. We handle the rest.</p>
        </div>

        <div class="km-steps ">
          <div class="km-step white-box">
            <div class="km-icon">
              <ion-icon :icon="cartOutline" />
            </div>
            <div class="km-text">
              <div class="km-label text-gray-700">Order up to 10 products</div>
              <div class="km-meta">Choose from up to 3 different stores</div>
            </div>
          </div>

          <div class="km-connector"></div>

          <div class="km-step white-box">
            <div class="km-icon">
              <ion-icon :icon="homeOutline" />
            </div>
            <div class="km-text">
              <div class="km-label text-gray-700">Try items at home</div>
              <div class="km-meta">30‑minute trial window on delivery</div>
            </div>
          </div>

          <div class="km-connector"></div>

          <div class="km-step white-box">
            <div class="km-icon">
              <ion-icon :icon="cardOutline" />
            </div>
            <div class="km-text">
              <div class="km-label text-gray-700">Pay only for what you keep</div>
              <div class="km-meta">Instantly return the rest</div>
            </div>
          </div>

          <div class="km-connector"></div>

          <div class="km-step white-box">
            <div class="km-icon">
              <ion-icon :icon="repeatOutline" />
            </div>
            <div class="km-text">
              <div class="km-label text-gray-700">Return within 30 minutes</div>
              <div class="km-meta">Rider collects at your doorstep</div>
            </div>
          </div>
        </div>
      </div>
  </IonModal>
</template>

<script setup lang="ts">
import { IonModal, IonIcon } from '@ionic/vue'
import { cartOutline, homeOutline, cardOutline, repeatOutline } from 'ionicons/icons'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const close = () => {
  emit('close')
}
</script>

<style scoped>
.knowmore-sheet {
  width: 100%;
  padding: 24px 20px 28px;
  padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px));
}

.km-hero {
  text-align: center;
  margin-bottom: 18px;
}

.km-title {
  margin-top: 12px;
  font-size: 22px;
  font-weight: 700;
}

.km-sub {
  margin-top: 8px;
  font-size: 14px;
}

.km-steps {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
}

.km-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 8px 18px rgba(18, 26, 18, 0.08);
  position: relative;
}

.white-box {
  background: white !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.km-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(83, 129, 108, 0.1);
  color: #2f6b4a;
  font-size: 22px;
}

.km-text {
  flex: 1;
}

.km-label {
  font-size: 16px;
  font-weight: 600;
}

.km-meta {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.km-connector {
  height: 20px;
  margin: 0 auto;
  width: 2px;
  background: linear-gradient(#e5e7eb, rgba(229, 231, 235, 0));
  border-radius: 2px;
}
</style>