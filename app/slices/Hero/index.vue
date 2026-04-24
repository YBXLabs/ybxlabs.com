<script setup lang="ts">
import gsap from "gsap";
import type { Content } from "@prismicio/client";

const props = defineProps(
  getSliceComponentProps<Content.HeroSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ])
);

const allImages = computed(() => {
  const imgs: any[] = [];
  if (props.slice.primary.image?.url) {
    imgs.push(props.slice.primary.image);
  }
  if (props.slice.items?.length) {
    for (const item of props.slice.items) {
      if ((item as any).gallery_image?.url) {
        imgs.push((item as any).gallery_image);
      }
    }
  }
  return imgs;
});

const hasMultiple = computed(() => allImages.value.length > 1);
const currentIdx = ref(0);
let interval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce"
  ).matches;

  if (prefersReducedMotion) {
    gsap.set(
      ".hero__heading, .hero__body, .hero__button, .hero__image, .hero__glow",
      {
        opacity: 1,
      }
    );

    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  tl.fromTo(
    ".hero__heading",
    { scale: 0.5 },
    { scale: 1, opacity: 1, duration: 1.4 }
  );
  tl.fromTo(
    ".hero__body",
    { y: 20 },
    { y: 0, opacity: 1, duration: 1.2 },
    "-=0.6"
  );
  tl.fromTo(
    ".hero__button",
    { scale: 1.5 },
    { scale: 1, opacity: 1, duration: 1.3 },
    "-=0.8"
  );
  tl.fromTo(
    ".hero__image",
    { y: 100 },
    { y: 0, opacity: 1, duration: 1.3 },
    "+=0.3"
  );
  tl.fromTo(
    ".hero__glow",
    { scale: 0.5 },
    { scale: 1, opacity: 1, duration: 1.8 },
    "-=1"
  );

  gsap.to(".hero__glow--one", {
    ease: "power2.inOut",
    repeat: -1,
    repeatDelay: 0,
    keyframes: [
      { top: "0%", left: "33%", duration: 0 },
      { top: "33%", left: "33%", duration: 2 },
      { top: "33%", left: "0%", duration: 3 },
      { top: "0%", left: "0%", duration: 2 },
      { top: "0%", left: "33%", duration: 3 },
    ],
  });

  gsap.to(".hero__glow--two", {
    ease: "power2.inOut",
    repeat: -1,
    repeatDelay: 0,
    keyframes: [
      { top: "33%", left: "0%", duration: 0 },
      { top: "0%", left: "0%", duration: 2 },
      { top: "0%", left: "33%", duration: 3 },
      { top: "33%", left: "33%", duration: 2 },
      { top: "33%", left: "0%", duration: 3 },
    ],
  });

  if (hasMultiple.value) {
    interval = setInterval(() => {
      currentIdx.value = (currentIdx.value + 1) % allImages.value.length;
    }, 4000);
  }
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <Bounded
    data-slice-type="slice.slice_type"
    data-slice-variation="slice.variation"
  >
    <div class="relative text-center">
      <YBXLabsGrid />
      <PrismicText
        :field="slice.primary.heading"
        class="hero__heading mx-auto max-w-3xl text-balance text-5xl font-medium opacity-0 md:text-7xl"
        wrapper="h1"
      />
      <PrismicText
        :field="slice.primary.body"
        class="hero__body mx-auto mt-6 max-w-md text-balance text-gray-300 opacity-0"
        wrapper="p"
      />
      <div class="flex flex-wrap gap-8 justify-center">
        <PrismicLink
          v-for="cta in slice.primary.ctas"
          :key="cta.key"
          class="hero__button buttonLink mt-8 opacity-0"
          :field="cta"
        />
      </div>
      <div class="hero__image glass-container mt-16 w-fit opacity-0">
        <div
          class="hero__glow hero__glow--one absolute left-1/3 top-0 -z-10 h-2/3 w-2/3 bg-sky-700/50 opacity-0 mix-blend-screen blur-3xl filter md:blur-[120px]"
        />
        <div
          class="hero__glow hero__glow--two absolute left-0 top-1/3 -z-10 h-2/3 w-2/3 bg-teal-600/50 opacity-0 mix-blend-screen blur-3xl filter md:blur-[120px]"
        />

        <!-- Image carousel -->
        <div class="relative">
          <template v-if="hasMultiple">
            <TransitionGroup name="hero-fade">
              <SmartImage
                v-for="(img, idx) in allImages"
                v-show="idx === currentIdx"
                :key="img.url"
                :field="img"
                class="rounded-lg"
              />
            </TransitionGroup>

            <div class="absolute -bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              <button
                v-for="(_, idx) in allImages"
                :key="idx"
                class="h-1.5 rounded-full transition-all duration-300"
                :class="idx === currentIdx ? 'w-5 bg-teal-400' : 'w-1.5 bg-gray-600'"
                @click="currentIdx = idx"
              />
            </div>
          </template>
          <SmartImage
            v-else-if="allImages.length"
            :field="allImages[0]"
            class="rounded-lg"
          />
        </div>
      </div>
    </div>
  </Bounded>
</template>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.6s ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
.hero-fade-leave-active {
  position: absolute;
  inset: 0;
}
</style>
