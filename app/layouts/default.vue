<script lang="ts" setup>
import CallToActionComponent from "~/slices/CallToAction/index.vue";

const prismic = usePrismic();
const { data: settings } = await useAsyncData("settings", () =>
  prismic.client.getSingle("settings")
);

// Check if current route is home page
const route = useRoute();
const isHomePage = computed(() => route.path === "/" || route.path === "");

// Create a mock slice for the CallToAction
const callToActionSlice = {
  slice_type: "call_to_action",
  variation: "default",
  primary: {
    heading: [{ type: "heading2", text: "Ready to get started?", spans: [] }],
    ctas: [
      {
        text: "Contact Us",
        url: "https://yesbhautikx.co.in/get-a-quote/",
      },
    ],
  },
  items: [],
};

useSeoMeta({
  title: settings.value?.data.site_title,
  ogTitle: settings.value?.data.site_title,
  description: settings.value?.data.meta_description,
  ogDescription: settings.value?.data.meta_description,
  ogImage: computed(() => prismic.asImageSrc(settings.value?.data.meta_image)),
});
</script>

<template>
  <div>
    <AppHeader :settings="settings" />
    <slot />
    <div v-if="!isHomePage">
      <CallToActionComponent
        :slice="callToActionSlice"
        :index="0"
        :slices="[]"
      />
    </div>
  </div>
</template>
