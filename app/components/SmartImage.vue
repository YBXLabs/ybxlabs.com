<script setup lang="ts">
const props = defineProps<{
  field: any;
  class?: string;
}>();

const isGif = computed(() => {
  const url = props.field?.url || "";
  return url.includes(".gif") || url.includes("fm=gif");
});

const gifSafeUrl = computed(() => {
  if (!props.field?.url) return "";
  const url = props.field.url;
  if (url.includes(".gif") && !url.includes("fm=gif")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}fm=gif`;
  }
  return url;
});
</script>

<template>
  <img
    v-if="isGif"
    :src="gifSafeUrl"
    :alt="field?.alt || ''"
    :width="field?.dimensions?.width"
    :height="field?.dimensions?.height"
    :class="props.class"
    loading="lazy"
  />
  <PrismicImage
    v-else
    :field="field"
    :class="props.class"
  />
</template>
