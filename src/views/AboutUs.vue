<template>
  <ion-page>
    <Topbar title="About Us" />

    <ion-content :fullscreen="true" class="ion-padding about-page">
      <section class="hero">
        <div class="hero-chip">ABOUT MARKIT</div>
        <h1 class="hero-title">Fashion You Can Feel Before You Pay</h1>
        <p class="hero-copy">
          Markit was built to remove shopping guesswork. Customers try styles at home,
          keep what works, and pay with confidence.
        </p>

        <div class="hero-stats">
          <div class="stat glass-card">
            <p class="stat-value">30 min</p>
            <p class="stat-label">Trial Window</p>
          </div>
          <div class="stat glass-card">
            <p class="stat-value">Doorstep</p>
            <p class="stat-label">Experience</p>
          </div>
          <div class="stat glass-card">
            <p class="stat-value">Simple</p>
            <p class="stat-label">Returns</p>
          </div>
        </div>
      </section>

      <section class="story">
        <article class="story-card glass-card">
          <span class="story-dot"></span>
          <h2>Our Mission</h2>
          <p>
            Make fashion shopping simple and confident by allowing customers to try products
            before purchase, with fast doorstep service.
          </p>
        </article>

        <article class="story-card glass-card">
          <span class="story-dot"></span>
          <h2>What We Do</h2>
          <p>
            We connect local stores and shoppers through a curated marketplace with trial-first
            delivery, smooth returns, and transparent billing.
          </p>
        </article>

        <article class="story-card glass-card">
          <span class="story-dot"></span>
          <h2>Why Markit</h2>
          <p>
            Better fit decisions, less guesswork, lower return friction, and a human support
            experience designed around reliability.
          </p>
        </article>
      </section>

      <section class="company glass-card">
        <p class="company-kicker">OPERATED BY</p>
        <h2 class="company-name">FLOBIT TECHNOLOGIES PRIVATE LIMITED</h2>
        <p class="company-address">
          2nd Floor, K-tech Innovation Hub, Plama Center,
          Bejai - Kapikad Road, Mangaluru, Karnataka - 575004
        </p>
      </section>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import Topbar from '@/components/Topbar.vue'
</script>

<style scoped>
.about-page {
  --background: var(--markit-bg);
  --padding-top: 10px;
  --padding-bottom: calc(24px + var(--markit-bottom-inset));
  display: grid;
  gap: 18px;
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 20px 16px 16px;
  border-radius: 24px;
  border: 1px solid rgba(83, 129, 108, 0.22);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), var(--markit-glass-shadow-lg);
  background:
    radial-gradient(120% 120% at 5% 0%, rgba(83, 129, 108, 0.24) 0%, rgba(83, 129, 108, 0) 64%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.5), rgba(237, 245, 241, 0.35));
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 38%, transparent);
  background: color-mix(in srgb, var(--ion-color-primary) 12%, #ffffff);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.hero-title {
  margin-top: 10px;
  font-size: 1.72rem;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #15202d;
}

.hero-copy {
  margin-top: 12px;
  color: #364152;
  line-height: 1.58;
  font-size: 0.94rem;
}

.hero-stats {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.stat {
  border-radius: 14px;
  padding: 10px 8px;
  text-align: center;
}

.stat-value {
  color: #1f2937;
  font-weight: 800;
  font-size: 0.92rem;
  line-height: 1.1;
}

.stat-label {
  margin-top: 4px;
  font-size: 0.73rem;
  color: #4b5563;
}

.story {
  display: grid;
  gap: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.story-card {
  position: relative;
  border-radius: 18px;
  padding: 14px 14px 14px 34px;
}

.story-dot {
  position: absolute;
  left: 13px;
  top: 18px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--ion-color-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ion-color-primary) 18%, transparent);
}

.story-card h2 {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--markit-text);
  margin-bottom: 6px;
}

.story-card p {
  color: var(--markit-text-muted);
  line-height: 1.5;
  font-size: 0.92rem;
}

.company {
  border-radius: 20px;
  padding: 16px;
  margin-top: 2px;
  margin-bottom: 4px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.52) 0%, rgba(236, 245, 240, 0.28) 100%),
    var(--markit-glass-surface);
}

.company-kicker {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #5b6778;
  margin-bottom: 6px;
}

.company-name {
  font-size: 1rem;
  font-weight: 800;
  color: #2d5444;
  line-height: 1.3;
}

.company-address {
  margin-top: 8px;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--markit-text-muted);
}

@media (min-width: 768px) {
  .about-page {
    max-width: 980px;
    margin: 0 auto;
  }

  .hero {
    padding: 24px 22px 18px;
  }

  .hero-title {
    font-size: 2rem;
  }
}
</style>

