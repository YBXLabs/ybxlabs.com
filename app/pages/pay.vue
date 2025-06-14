<script setup lang="ts">
// Redirect /pay to /payment to maintain compatibility
await navigateTo('/payment', { replace: true })
</script>

<template>
  <div>Redirecting to payment...</div>
</template> 