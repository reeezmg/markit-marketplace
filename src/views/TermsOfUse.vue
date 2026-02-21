<template>
  <ion-page>
    <Topbar title="Terms of Use" />

    <!-- CONTENT -->
    <ion-content :fullscreen="true" class="ion-padding terms-content">
      <!-- TOP INFO -->
      <div class="flex flex-col items-center text-center pt-8 pb-6">
        <h1 class="text-2xl font-bold">TERMS OF USE</h1>
        <p class="text-lg font-semibold mt-2">MARKIT</p>
        <p class="text-sm font-medium mt-1">
          Operated by Flobit Technologies Private Limited
        </p>
        <p class="text-sm text-gray-600 mt-3">
          Effective Date – September 17, 2025
        </p>
        <p class="text-sm text-gray-600">
          Last Updated – September 17, 2025
        </p>
      </div>

      <!-- ACCORDIONS -->
      <ion-accordion-group class="terms-accordion-group">

        <!-- INTRODUCTION -->
        <ion-accordion value="intro">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Introduction</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              Welcome to <strong>Markit</strong>, a try-first fashion platform
              operated by <strong>Flobit Technologies Private Limited</strong>,
              a company incorporated under the laws of India, having its
              registered office at 2nd Floor, K-Tech Innovation Hub, Plama Center, Bejai – Kapikad Road, Mangaluru, Karnataka – 575004
              (“Flobit”, “we”, “us”, “our”).
            </p>
            <p class="mt-2">
              By accessing, downloading, installing, or using the Markit mobile
              application (“App”), you agree to be bound by these Terms of Use
              (“Terms”).
            </p>
            <p class="mt-2">
              If you do not agree with any part of these Terms, you must
              immediately discontinue use of the App.
            </p>
          </div>
        </ion-accordion>

        <!-- AGREEMENT -->
        <ion-accordion value="agreement">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Agreement to Legal Terms</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              These Terms constitute an electronic record under the Information
              Technology Act, 2000 and the rules made thereunder, including the
              Information Technology (Intermediary Guidelines and Digital Media
              Ethics Code) Rules, 2021.
            </p>
            <p class="mt-2">
              This electronic record does not require any physical or digital
              signature.
            </p>
            <p class="mt-2 font-semibold">
              BY LOGGING INTO THE APP, YOU CONFIRM THAT YOU HAVE READ, UNDERSTOOD, AND
              ACCEPTED THESE TERMS IN FULL.
            </p>
            <p class="mt-2">
              Continued use constitutes your binding consent and agreement not
              to dispute acceptance at a later stage.
            </p>
          </div>
        </ion-accordion>

        <!-- ELIGIBILITY -->
        <ion-accordion value="eligibility">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">User Eligibility</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              You represent that you are at least 18 years of age or have obtained
              parental or guardian consent to use the App.
            </p>
            <p class="mt-2">
              If you are under 18, usage is permitted only under the supervision
              and consent of a parent or legal guardian.
            </p>
          </div>
        </ion-accordion>

        <!-- OUR SERVICES -->
        <ion-accordion value="services">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Our Services</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              Markit provides a “Try & Buy” fashion experience across India.
            </p>
            <ul class="list-disc pl-4 mt-2">
              <li>Select multiple fashion products from partner brands</li>
              <li>Receive delivery at your doorstep</li>
              <li>Try products within a 30-minute window</li>
              <li>Purchase selected items and instantly return others</li>
            </ul>
            <p class="mt-2">
              Certain products may be offered under a consignment model, where
              ownership remains with vendors until purchase.
            </p>
          </div>
        </ion-accordion>

        <!-- USER REGISTRATION -->
        <ion-accordion value="registration">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">User Registration</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              You may be required to register an account to access certain
              features.
            </p>
            <p class="mt-2">
              You are responsible for maintaining the confidentiality of your
              login credentials and all activities under your account.
            </p>
            <p class="mt-2">
              We reserve the right to suspend or terminate accounts containing
              inaccurate, misleading, or incomplete information.
            </p>
          </div>
        </ion-accordion>

        <!-- PRODUCTS -->
        <ion-accordion value="products">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Products & Availability</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              We strive to display accurate product details, pricing, and colors.
              However, display variations may occur due to device limitations.
            </p>
            <p class="mt-2">
              All products are subject to availability and may be discontinued
              without prior notice.
            </p>
          </div>
        </ion-accordion>

        <!-- PAYMENTS -->
        <ion-accordion value="payments">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Purchases & Payments</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <ul class="list-disc pl-4">
              <li>Payments via Credit Cards, Debit Cards, and UPI</li>
              <li>All prices listed in INR</li>
              <li>Applicable taxes deducted as required by law</li>
              <li>Orders may be cancelled within 15 minutes of placement</li>
            </ul>
            <p class="mt-2">
              We reserve the right to refuse or cancel orders suspected of fraud,
              resale, or misuse.
            </p>
          </div>
        </ion-accordion>

        <!-- RETURNS -->
        <ion-accordion value="returns">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Returns & Trial Policy</ion-label>
          </ion-item>
         <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
  <p>
    Users are provided a <strong>30-minute trial window</strong> from the time of delivery.
  </p>

  <p class="mt-2">
    Once a product is purchased after the trial period, any return or refund must be handled directly with the respective store, following their return and refund policy mentioned in the invoice receipt.
  </p>

  <p class="mt-2">
    If the product is purchased from Markit’s cloud store, returns or exchanges must be initiated within <strong>10 days</strong> from the date of purchase.
  </p>

  <p class="mt-2">
    Products must be returned with tags intact and without any misuse.
  </p>

  <p class="mt-2">
    Users are responsible for product safety until it is returned.
  </p>
</div>
        </ion-accordion>

        <!-- PROHIBITED ACTIVITIES -->
        <ion-accordion value="prohibited">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Prohibited Activities</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <ul class="list-disc pl-4">
              <li>Fraud, misrepresentation, or deception</li>
              <li>Reverse engineering or tampering</li>
              <li>Unauthorized data scraping</li>
              <li>Harassment, abuse, or unlawful behavior</li>
              <li>Commercial exploitation of the platform</li>
            </ul>
          </div>
        </ion-accordion>

        <!-- DISCLAIMER -->
        <ion-accordion value="disclaimer">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Disclaimer</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              The Services are provided on an “as-is” and “as-available” basis.
            </p>
            <p class="mt-2">
              We make no warranties regarding accuracy, reliability, or
              uninterrupted access.
            </p>
          </div>
        </ion-accordion>

        <!-- LIABILITY -->
        <ion-accordion value="liability">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Limitation of Liability</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              Flobit Technologies Private Limited shall not be liable for indirect,
              incidental, or consequential damages.
            </p>
            <p class="mt-2">
              Total liability, if any, shall be limited to the amount paid by the
              user.
            </p>
          </div>
        </ion-accordion>

        <!-- GOVERNING LAW -->
        <ion-accordion value="law">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Governing Law</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p>
              These Terms are governed by the laws of India.
            </p>
            <p class="mt-2">
              Courts in India shall have exclusive jurisdiction.
            </p>
          </div>
        </ion-accordion>

        <!-- CONTACT -->
        <ion-accordion value="contact">
          <ion-item slot="header" class="rounded-xl">
            <ion-label class="font-semibold">Contact Us</ion-label>
          </ion-item>
          <div slot="content" class="px-4 pb-5 text-sm leading-relaxed text-gray-700">
            <p><strong>Flobit Technologies Private Limited</strong></p>
            <p class="mt-1">
              2nd Floor, K-Tech Innovation Hub, Plama Center,<br />
              Bejai – Kapikad Road,<br />
              Mangaluru, Karnataka – 575004
            </p>
            <p class="mt-1">📧 reez@markit.co.in</p>
            <p>📞 +91 9538340789</p>
          </div>
        </ion-accordion>

      </ion-accordion-group>

      <p class="text-center text-xs text-gray-400 mt-6 mb-4">
        © 2025 Flobit Technologies Private Limited. All rights reserved.
      </p>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel
} from '@ionic/vue'
import Topbar from '@/components/Topbar.vue'
</script>

<style scoped>
.terms-content {
  --padding-top: 6px !important;
  --padding-bottom: 16px !important;
  --padding-start: 12px !important;
  --padding-end: 12px !important;
  --background: var(--markit-bg);
}

.terms-content ion-item {
  --background: transparent;
  --background-hover: transparent;
  --background-activated: transparent;
  --background-focused: transparent;
  --ripple-color: transparent;
  border-radius: 16px;
  margin-bottom: 10px;
  overflow: hidden;
}

.terms-content ion-item::part(native) {
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
  border-radius: 16px;
}

.terms-content ion-label {
  font-weight: 600;
  color: var(--markit-text);
}

.terms-content [slot='content'] {
  color: var(--markit-text-muted);
}

.terms-accordion-group {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.terms-accordion-group ion-accordion {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  margin: 0 0 10px 0;
  border-radius: 16px;
  overflow: hidden;
}

.terms-accordion-group ion-accordion::part(content) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}
</style>
