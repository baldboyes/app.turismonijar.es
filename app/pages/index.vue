<template>
  <ion-page>

    <ion-content class="ion-padding">
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>

      <p>Here's a small text description for the content. Nothing more, nothing less.</p>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <ion-title> Footer </ion-title>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
  import { IonContent, IonFooter, IonHeader, IonTitle, IonToolbar, IonPage } from '@ionic/vue';

  useSeoMeta({
    title: 'Inicio',
    description: 'Guía de turismo oficial de Níjar. Descubre sus playas, monumentos, senderos y eventos.',
  })
</script>