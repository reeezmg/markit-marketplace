<template>
  <ion-page>
    <Topbar title="Contact Us" />

    <ion-content :fullscreen="true" class="ion-padding contact-page">
      <section class="contact-hero glass-card">
        <p class="kicker">LEGAL ENTITY</p>
        <h1 class="company">FLOBIT TECHNOLOGIES PRIVATE LIMITED</h1>
        <p class="helper">Reach out anytime. Tap any option below to connect directly.</p>
      </section>

      <section class="contact-list">
        <a class="contact-card glass-card" href="tel:+919538340789">
          <span class="card-title">Call Us</span>
          <span class="card-value">+91 9538340789</span>
        </a>

        <a class="contact-card glass-card" href="mailto:reez@markit.co.in">
          <span class="card-title">Email Us</span>
          <span class="card-value">reez@markit.co.in</span>
        </a>

        <a
          class="contact-card glass-card"
          href="https://wa.me/919538340789?text=Hello%2C%20I%20need%20help"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="card-title">WhatsApp</span>
          <span class="card-value">Chat on WhatsApp</span>
        </a>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import Topbar from '@/components/Topbar.vue'
</script>

<style scoped>
.contact-page {
  --background: var(--markit-bg);
  --padding-top: 10px;
  --padding-bottom: calc(20px + var(--markit-bottom-inset));
  display: grid;
  gap: 14px;
}

.contact-hero {
  border-radius: 20px;
  padding: 18px 16px;
  background:
    radial-gradient(120% 120% at 8% 0%, rgba(83, 129, 108, 0.2) 0%, rgba(83, 129, 108, 0) 64%),
    var(--markit-glass-surface);
}

.kicker {
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.company {
  margin-top: 8px;
  color: var(--markit-text);
  font-size: 1.2rem;
  line-height: 1.25;
  font-weight: 800;
}

.helper {
  margin-top: 8px;
  color: var(--markit-text-muted);
  font-size: 0.9rem;
}

.contact-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.contact-card {
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-decoration: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.contact-card:hover,
.contact-card:focus-visible {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow-lg);
  outline: none;
}

.card-title {
  font-size: 0.86rem;
  color: var(--markit-text-muted);
}

.card-value {
  font-size: 1rem;
  font-weight: 700;
  color: #2d5444;
}
</style>

