<template>
  <div class="mb-4 -mt-4 opacity-80">
    <h4 class="text-[10px] font-bold text-gray-600 tracking-wider text-left pt-0 mt-0">
      {{ $t('beach_flags') }}
    </h4>
    <div class="grid grid-cols-2 gap-3 text-[11px]">
      <div class="flex items-center gap-2">
        <img src="/banderas/estados/verde_.svg" alt="" aria-hidden="true" class="w-5 h-5 object-contain" />
        <span class="text-gray-600 font-medium">{{ $t('verde') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <img src="/banderas/estados/amarilla_.svg" alt="" aria-hidden="true" class="w-5 h-5 object-contain" />
        <span class="text-gray-600 font-medium">{{ $t('amarilla') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <img src="/banderas/estados/amarilla_por_medusa_.svg" alt="" aria-hidden="true" class="w-5 h-5 object-contain" />
        <span class="text-gray-600 font-medium">{{ $t('amarilla_por_medusa') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <img src="/banderas/estados/roja_.svg" alt="" aria-hidden="true" class="w-5 h-5 object-contain" />
        <span class="text-gray-600 font-medium">{{ $t('roja') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>
