<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="flex flex-col w-full h-full items-center justify-center p-6">
        <!-- Heading -->
        <div class="mt-6 text-2xl font-bold text-center">
          Order Confirmed!
        </div>
        <!-- Success GIF -->
        <div class="mb-8 w-40 h-40 flex items-center justify-center">
          <img src="@/assets/pay.gif" alt="Order Success" class="w-full h-full object-contain" />
        </div> 

        <!-- Subheading -->
        <div class="text-2xl font-bold text-center">
          What’s Next?
        </div>

        <!-- Steps -->
        <div class="flex flex-col">
          <div class="knowmore-sheet">
            <div class="km-steps ">
              <div class="km-step iced">
                <div class="km-dot"></div>
                <div class="km-icon">
                  <ion-icon :icon="homeOutline" />
                </div>
                <div class="km-text">
                  <div class="km-label">Try items at home</div>
                  <div class="km-meta">30‑minute trial window on delivery</div>
                </div>
              </div>

              <div class="km-connector"></div>

              <div class="km-step iced">
                <div class="km-dot"></div>
                <div class="km-icon">
                  <ion-icon :icon="cardOutline" />
                </div>
                <div class="km-text">
                  <div class="km-label">Pay only for what you keep</div>
                  <div class="km-meta">Instantly return the rest</div>
                </div>
              </div>

              <div class="km-connector"></div>

              <div class="km-step iced">
                <div class="km-dot"></div>
                <div class="km-icon">
                  <ion-icon :icon="repeatOutline" />
                </div>
                <div class="km-text">
                  <div class="km-label">Return within 30 minutes</div>
                  <div class="km-meta">Rider collects at your doorstep</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="footer">
      <div class="p-4">
        <ion-button expand="block" @click="handleClose">
          Close
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonFooter, IonContent, IonButton, IonIcon, onIonViewWillEnter } from '@ionic/vue'
import { useIonRouter } from '@ionic/vue'
import { useCartStore } from '@/store/useCartStore'
import { homeOutline, cardOutline, repeatOutline } from 'ionicons/icons'

const cart = useCartStore()
const router = useIonRouter()

// --- Load cart ---
onIonViewWillEnter(async () => {
  try {
    await cart.loadCart()
  } catch (error) {
    console.error('Failed to load cart items:', error)
  }
})

// ✅ Helper: compute total item count from nested structure
const getCartItemCount = () => {
  return cart.groups.reduce((total, group) => {
    const groupTotal = group.companies.reduce((sum, company) => {
      return sum + (company.items?.length || 0)
    }, 0)
    return total + groupTotal
  }, 0)
}

// ✅ Handle close logic
const handleClose = async () => {
  await cart.loadCart()
  const totalItems = getCartItemCount()

  if (totalItems > 0) {
    router.push({ name: 'cart' })
  } else {
    router.push({ name: 'shops' })
  }
}


</script>
<style scoped>
.knowmore-sheet {
  width: 100%;
  padding: 24px 20px 28px;
  padding-bottom: calc(28px + var(--markit-bottom-inset));
}

.km-hero {
  text-align: center;
  margin-bottom: 18px;
}

.km-title {
  margin-top: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.km-sub {
  margin-top: 8px;
  font-size: 14px;
  color: #000000;
}

.km-steps {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  padding-left: 6px;
}

.km-steps::before {
  content: "";
  position: absolute;
  left: 14px;
  top: 8px;
  bottom: 8px;
  width: 2px;

  border-radius: 2px;
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

.iced {
  background: #ffffff;
}

.km-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #53816c;
  box-shadow: 0 0 0 4px rgba(83, 129, 108, 0.15);
  margin-left: -6px;
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
  color: #1f2937;
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
.footer {
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  padding-bottom: var(--markit-bottom-inset);
}
</style>
