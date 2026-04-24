<script setup lang="ts">
import type { Content } from "@prismicio/client";
import YBXLabsText from "~/components/RichText/YBXLabsText.vue";
import Heading2 from "~/components/RichText/Heading2.vue";

const props = defineProps(
  getSliceComponentProps<Content.BentoSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ])
);

function getBoxImages(box: any): any[] {
  const imgs: any[] = [];
  if (box.image?.url) imgs.push(box.image);
  if (box.image_2?.url) imgs.push(box.image_2);
  if (box.image_3?.url) imgs.push(box.image_3);
  if (box.image_4?.url) imgs.push(box.image_4);
  return imgs;
}

const activeIndices = ref<Record<number, number>>({});
const intervals: ReturnType<typeof setInterval>[] = [];

onMounted(() => {
  props.slice.primary.bento?.forEach((box: any, boxIdx: number) => {
    const imgs = getBoxImages(box);
    if (imgs.length > 1) {
      activeIndices.value[boxIdx] = 0;
      const id = setInterval(() => {
        activeIndices.value[boxIdx] = ((activeIndices.value[boxIdx] ?? 0) + 1) % imgs.length;
      }, 3500 + boxIdx * 500);
      intervals.push(id);
    }
  });
});

onUnmounted(() => {
  intervals.forEach(clearInterval);
});
</script>

<template>
  <Bounded
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
  >
    <PrismicRichText
      :field="slice.primary.heading"
      :components="{ em: YBXLabsText, heading2: Heading2 }"
    />
    <PrismicRichText
      class="mx-auto mt-6 max-w-md text-balance text-center text-gray-300"
      :field="slice.primary.body"
      wrapper="div"
    />
    <div
      class="mt-16 grid max-w-4xl grid-rows-[auto_auto_auto] gap-8 md:grid-cols-3 md:gap-10"
    >
      <article
        v-for="(box, boxIdx) in slice.primary.bento"
        :key="$prismic.asText(box.title)"
        class="glass-container row-span-3 grid grid-rows-subgrid gap-4 rounded-lg bg-gray-950/60 p-4 before:bg-gray-100/10"
        :class="box.is_wide ? 'md:col-span-2' : 'md:col-span-1'"
      >
        <PrismicText :field="box.title" wrapper="h3" class="text-2xl" />
        <PrismicRichText
          :field="box.body"
          wrapper="div"
          class="max-w-md text-balance text-gray-300"
        />

        <!-- Image carousel per bento card -->
        <div class="relative overflow-hidden">
          <template v-if="getBoxImages(box).length > 1">
            <TransitionGroup name="bento-fade">
              <SmartImage
                v-for="(img, imgIdx) in getBoxImages(box)"
                v-show="imgIdx === (activeIndices[boxIdx] ?? 0)"
                :key="img.url"
                :field="img"
                class="max-h-36 w-auto"
              />
            </TransitionGroup>
          </template>
          <SmartImage
            v-else
            :field="box.image"
            class="max-h-36 w-auto"
          />
        </div>
      </article>
    </div>
  </Bounded>
</template>

<style scoped>
.bento-fade-enter-active,
.bento-fade-leave-active {
  transition: opacity 0.5s ease;
}
.bento-fade-enter-from,
.bento-fade-leave-to {
  opacity: 0;
}
.bento-fade-leave-active {
  position: absolute;
  inset: 0;
}
</style>
