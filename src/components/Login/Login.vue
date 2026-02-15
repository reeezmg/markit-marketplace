<template>
  <div class="space-y-4">
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

      <div class="mt-4 space-y-2 text-sm" :class="appMuted">
        <div class="flex items-center gap-2">
          <ion-icon :icon="checkmarkCircleOutline" class="text-[var(--ion-color-primary)] text-lg" />
          <span>Fast checkout and saved addresses</span>
        </div>
        <div class="flex items-center gap-2">
          <ion-icon :icon="checkmarkCircleOutline" class="text-[var(--ion-color-primary)] text-lg" />
          <span>Order updates in real time</span>
        </div>
        <div class="flex items-center gap-2">
          <ion-icon :icon="checkmarkCircleOutline" class="text-[var(--ion-color-primary)] text-lg" />
          <span>Exclusive drops and early access</span>
        </div>
      </div>

      <ion-button
        expand="block"
        color="primary"
        class="markit-cta mt-5"
        @click="$emit('loginClicked')"
      >
        Continue
      </ion-button>

      <p class="text-xs mt-4 text-center" :class="appMuted">
        By continuing, you accept the
        <a href="#" class="underline" :class="appText">terms of service</a> &
        <a href="#" class="underline" :class="appText">privacy policy</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { checkmarkCircleOutline } from 'ionicons/icons'
import { IonButton, IonIcon } from '@ionic/vue'

defineEmits(['loginClicked'])
</script>

<style scoped>
/* ====================================================
   GLASS LOGIN PANEL – matches app design system
==================================================== */

.login-panel {
  padding: 20px 18px 24px;
  border-radius: 20px;

  /* Glass morphism – exact match of other cards */
  background: var(--markit-glass-surface);
  border: 1px solid var(--markit-glass-border);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.login-panel:hover,
.login-panel:focus-within {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow-lg);
}

.mini-badge {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ion-color-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 20%, var(--markit-glass-border));
  color: var(--ion-color-primary);
  font-weight: 600;
  letter-spacing: 0.3px;
  backdrop-filter: blur(4px);
}

/* ----- Text colours – use design tokens ----- */
.app-text {
  color: var(--markit-text);
}

.app-muted {
  color: var(--markit-text-muted);
}

/* ----- Button – already styled globally, just ensure spacing ----- */
.markit-cta {
  --border-radius: var(--markit-radius-pill);
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-weight: 700;
  text-transform: none;
  margin-top: 20px;
}

/* ----- Icon sizing ----- */
ion-icon {
  font-size: 1.25rem;
}

/* ----- Responsive tweaks ----- */
@media (max-width: 390px) {
  .login-panel {
    padding: 18px 16px 22px;
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
}
</style>