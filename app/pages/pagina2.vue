<template>
  <ion-page>
    <ion-content :fullscreen="false">
      <header class="bg-white pb-4 px-4 shadow-sm">
        <h1>Mi Título2</h1>
      </header>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
  useSeoMeta({
    title: 'Página 2',
    description: 'Información y detalles adicionales sobre el turismo en Níjar.',
  })
</script>