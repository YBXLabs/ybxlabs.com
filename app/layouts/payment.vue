<template>
  <div class="payment-layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Clean payment layout without Prismic dependencies
useHead({
  bodyAttrs: {
    class: 'payment-page'
  }
})
</script>

<style>
.payment-layout {
  min-height: 100vh;
  position: relative;
}

.payment-page {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style> 