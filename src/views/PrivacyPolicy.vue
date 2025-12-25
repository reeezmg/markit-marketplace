<template>
  <ion-page>
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
  <ion-button @click="$router.back()">
    <ion-icon :icon="arrowBackOutline" />
  </ion-button>
</ion-buttons>

    <ion-title>Privacy Policy</ion-title>
  </ion-toolbar>
</ion-header>


    <ion-content class="privacy-content">

        <div class="flex-col items-center justify-center px-10 pt-8">
            <p class="text-[28px] font-bold text-center">PRIVACY POLICY</p>
            <p class="text-[20px] font-semibold text-center mt-4">FLOBIT TECHNOLOGIES PRIVATE LIMITED</p>
            <p class="text-[16px] font-medium text-center mt-6 text-gray-700">Effective Date - December 17, 2025</p>
            <p class="text-[16px] font-medium text-center mt-2 text-gray-700">Last updated - December 17, 2025</p>
        </div>
        

      <ion-accordion-group expand="inset" class="mt-6">

        <ion-accordion value="intro">
          <ion-item slot="header">
            <ion-label>Introduction</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <p>
              Thank you for choosing <strong>Markit</strong>, a fashion platform
              operated by <strong>Flobit Technologies Private Limited</strong>
              (“Flobit”, “we”, “us”, “our”).
            </p>
            <p>
              This Privacy Policy explains how we collect, use, store, disclose,
              and protect your personal information when you access or use our
              mobile application, website, or related services (“Platform”).
            </p>
            <p>
              By accessing or using the Platform, you confirm that you have read,
              understood, and agreed to this Privacy Policy.
            </p>
          </div>
        </ion-accordion>

        <ion-accordion value="summary">
          <ion-item slot="header">
            <ion-label>Summary of Key Points</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <ul>
              <li>We collect personal data required to provide our services.</li>
              <li>We do not process sensitive personal data.</li>
              <li>Payments are securely processed by Razorpay.</li>
              <li>We use industry-standard security practices.</li>
              <li>You retain full rights over your data under Indian law.</li>
            </ul>
          </div>
        </ion-accordion>

        <ion-accordion value="collection">
          <ion-item slot="header">
            <ion-label>Information We Collect</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <p><strong>Personal Information</strong></p>
            <ul>
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Shipping & billing address</li>
              <li>Date of birth</li>
              <li>Login credentials</li>
              <li>Uploaded photos or documents</li>
              <li>Location data (if permitted)</li>
            </ul>

            <p><strong>Payment Data</strong></p>
            <p>
              Payment details are processed securely by our payment partner
              <strong>Razorpay</strong>. We do not store card details.
            </p>

            <p><strong>Automatically Collected Data</strong></p>
            <p>
              This includes IP address, device type, operating system, usage
              logs, cookies, and crash analytics.
            </p>
          </div>
        </ion-accordion>

        <ion-accordion value="processing">
          <ion-item slot="header">
            <ion-label>How We Process Information</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <ul>
              <li>Create and manage user accounts</li>
              <li>Process orders, payments, and returns</li>
              <li>Provide customer support</li>
              <li>Send service-related communications</li>
              <li>Improve platform performance</li>
              <li>Prevent fraud and misuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </ion-accordion>

        <ion-accordion value="sharing">
          <ion-item slot="header">
            <ion-label>Sharing of Information</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <p>
              We may share your data with trusted third parties strictly for
              service delivery purposes, including:
            </p>
            <ul>
              <li>Payment processors</li>
              <li>Cloud hosting providers</li>
              <li>Logistics and delivery partners</li>
              <li>Analytics and performance tools</li>
            </ul>
            <p>
              All partners are bound by confidentiality and data protection
              agreements.
            </p>
          </div>
        </ion-accordion>

        <ion-accordion value="cookies">
          <ion-item slot="header">
            <ion-label>Cookies & Tracking Technologies</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <p>
              We use cookies, pixels, and similar technologies to enhance user
              experience, analyze traffic, and maintain platform security.
            </p>
            <p>
              You may control cookie preferences via your device or browser
              settings.
            </p>
          </div>
        </ion-accordion>

        <ion-accordion value="security">
          <ion-item slot="header">
            <ion-label>Security Measures</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <p>
              We implement reasonable technical and organizational safeguards
              including encryption, access controls, and secure servers, in
              compliance with the IT Act, 2000 and DPDP Act, 2023.
            </p>
            <p>
              However, no system can be completely secure. Users are advised to
              safeguard their credentials.
            </p>
          </div>
        </ion-accordion>

        <ion-accordion value="rights">
          <ion-item slot="header">
            <ion-label>Your Privacy Rights</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to correction or update</li>
              <li>Right to erasure</li>
              <li>Right to withdraw consent</li>
              <li>Right to grievance redressal</li>
              <li>Right to nominate a representative</li>
            </ul>
          </div>
        </ion-accordion>

        <ion-accordion value="grievance">
          <ion-item slot="header">
            <ion-label>Grievance Officer</ion-label>
          </ion-item>
          <div slot="content" class="accordion-content">
            <p><strong>Name:</strong> Reez</p>
            <p><strong>Email:</strong> reez@markit.co.in</p>
            <p>
              <strong>Address:</strong><br />
              2nd Floor, K-tech Innovation Hub, Plama Center, <br />
             Bejai - Kapikad Rd, <br />
            Mangaluru, Karnataka - 575004
            </p>
          </div>
        </ion-accordion>

      </ion-accordion-group>

    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
} from '@ionic/vue'
import { arrowBackOutline } from 'ionicons/icons';
</script>

<style scoped>
.privacy-content {
  --padding-top: 0 !important;
  --padding-bottom: 16px !important;
  --padding-start: 12px !important;
  --padding-end: 12px !important;
}

.accordion-content {
  padding: 12px 16px 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #444;
}

ion-item {
  --background: #fff;
  border-radius: 10px;
  margin-bottom: 6px;
}

ion-label {
  font-weight: 600;
}
</style>
