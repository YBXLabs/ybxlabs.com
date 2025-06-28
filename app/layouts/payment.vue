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
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  position: relative;
  overflow-x: hidden;
}

.payment-page {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  /* Ensure smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;
  /* Prevent bounce effect on iOS */
  overscroll-behavior: none;
}
</style> 