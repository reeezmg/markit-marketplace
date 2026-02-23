<template>
  <div class="login-wrapper">
    <div class="login-panel glass-card">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold" :class="appText">Welcome back</h3>
          <p class="text-sm mt-1" :class="appMuted">
            Login or create an account to manage orders and track deliveries.
          </p>
        </div>
        <div class="mini-badge">Secure</div>
      </div>

      <div class="mt-5 space-y-3 text-sm" :class="appMuted">
        <div class="flex items-center gap-3">
          <div class="check-icon">
            <ion-icon :icon="checkmarkCircleOutline" />
          </div>
          <span>Fast checkout and saved addresses</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="check-icon">
            <ion-icon :icon="checkmarkCircleOutline" />
          </div>
          <span>Order updates in real time</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="check-icon">
            <ion-icon :icon="checkmarkCircleOutline" />
          </div>
          <span>Exclusive drops and early access</span>
        </div>
      </div>

      <ion-button
        expand="block"
        color="primary"
        class="markit-cta mt-6"
        @click="$emit('loginClicked')"
      >
        Continue
      </ion-button>

      <div class="footer-links">
        <span class="text-xs" :class="appMuted">By continuing, you accept our</span>
        <div class="link-group">
          <span 
            class="link-text"
            :class="appText"
            @click="router.push({ name: 'account-terms-of-use' })"
          >
            Terms of Use
          </span>
          <span class="separator" :class="appMuted">•</span>
          <span 
            class="link-text"
            :class="appText"
            @click="router.push({ name: 'account-privacy-policy' })"
          >
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkmarkCircleOutline } from 'ionicons/icons'
import { IonButton, IonIcon } from '@ionic/vue'
import { useIonRouter } from '@ionic/vue'

const router = useIonRouter()

defineEmits(['loginClicked'])
</script>

<style scoped>
/* ====================================================
   LOGIN WRAPPER - Ensures panel stays in viewport
==================================================== */
.login-wrapper {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* ====================================================
   GLASS LOGIN PANEL – Clean, no hover animations
==================================================== */

.login-panel {
  padding: 20px 18px 22px;
  border-radius: 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  /* Clean glass morphism - no transitions */
  background: var(--markit-glass-surface);
  border: 1px solid var(--markit-glass-border);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  box-shadow: 
    inset 0 1px 0 var(--markit-glass-highlight),
    0 15px 30px -12px rgba(0, 0, 0, 0.2);
}

.mini-badge {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 30px;
  background: color-mix(in srgb, var(--ion-color-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 20%, var(--markit-glass-border));
  color: var(--ion-color-primary);
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

/* Check icon styling - clean, no animations */
.check-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--ion-color-primary);
}

.check-icon ion-icon {
  font-size: 18px;
}

/* Feature list items - no hover effects */
.space-y-3 .flex {
  padding: 0;
}

/* ----- Text colours – use design tokens ----- */
.app-text {
  color: var(--markit-text);
}

.app-muted {
  color: var(--markit-text-muted);
}

/* ----- Clean Button - no animations ----- */
.markit-cta {
  --border-radius: 40px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--ion-color-primary) 40%, transparent);
  font-weight: 600;
  text-transform: none;
  font-size: 15px;
  letter-spacing: 0.2px;
  margin-top: 20px;
  --transition: none;
}

.markit-cta::part(native) {
  transition: none;
}

/* ----- Footer Links - clean, no hover effects ----- */
.footer-links {
  margin-top: 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.link-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.link-text {
  font-size: 0.7rem;
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--markit-text) 30%, transparent);
  text-underline-offset: 2px;
  cursor: pointer;
  opacity: 0.9;
  letter-spacing: 0.2px;
  /* No hover effects */
}

.separator {
  font-size: 0.7rem;
  opacity: 0.5;
}

/* No animations */
.login-panel {
  animation: none;
}

/* ----- Responsive adjustments to ensure viewport fit ----- */
@media (max-width: 390px) {
  .login-panel {
    padding: 18px 16px 20px;
    border-radius: 22px;
  }

  .mini-badge {
    font-size: 10px;
    padding: 3px 10px;
  }

  h3 {
    font-size: 1.1rem;
  }

  p {
    font-size: 0.85rem;
  }
  
  .check-icon {
    width: 18px;
    height: 18px;
  }
  
  .check-icon ion-icon {
    font-size: 16px;
  }
  
  .markit-cta {
    --padding-top: 12px;
    --padding-bottom: 12px;
    font-size: 14px;
    margin-top: 18px;
  }
  
  .link-text {
    font-size: 0.65rem;
  }
}

/* Small height devices - ensure fit */
@media (max-height: 700px) {
  .login-panel {
    padding: 16px 16px 18px;
  }
  
  .mt-5 {
    margin-top: 12px;
  }
  
  .space-y-3 > :not([hidden]) ~ :not([hidden]) {
    margin-top: 8px;
  }
  
  .markit-cta {
    margin-top: 16px;
    --padding-top: 10px;
    --padding-bottom: 10px;
  }
  
  .footer-links {
    margin-top: 14px;
  }
}

/* Extra small height devices */
@media (max-height: 640px) {
  .login-panel {
    padding: 12px 14px 14px;
  }
  
  h3 {
    font-size: 1rem;
  }
  
  p, .space-y-3 span {
    font-size: 0.8rem;
  }
  
  .mini-badge {
    font-size: 9px;
    padding: 2px 8px;
  }
}
</style>