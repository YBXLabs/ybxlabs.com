<script setup lang="ts">
const props = defineProps(
  getSliceComponentProps(["slice", "index", "slices", "context"])
);

const currentYear = new Date().getFullYear();

const navColumns = computed(() => {
  const cols = [];
  const p = props.slice.primary;

  if (p.nav_column_1_title || p.nav_column_1_links?.length) {
    cols.push({ title: p.nav_column_1_title, links: p.nav_column_1_links });
  }
  if (p.nav_column_2_title || p.nav_column_2_links?.length) {
    cols.push({ title: p.nav_column_2_title, links: p.nav_column_2_links });
  }
  if (p.nav_column_3_title || p.nav_column_3_links?.length) {
    cols.push({ title: p.nav_column_3_title, links: p.nav_column_3_links });
  }

  return cols;
});
</script>

<template>
  <footer
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="mt-auto border-t border-gray-800"
  >
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <!-- Main Footer Content -->
      <div class="grid gap-10 py-12 md:gap-12 md:py-16 lg:grid-cols-12">
        <!-- Brand Column -->
        <div class="lg:col-span-4">
          <NuxtLink to="/" class="inline-block">
            <YBXLabsLogo />
          </NuxtLink>

          <p
            v-if="slice.primary.tagline"
            class="mt-4 max-w-xs text-sm leading-relaxed text-gray-400"
          >
            {{ slice.primary.tagline }}
          </p>

          <!-- Social Icons -->
          <div
            v-if="slice.primary.social_links?.length"
            class="mt-6 flex flex-wrap items-center gap-2.5"
          >
            <PrismicLink
              v-for="(social, idx) in slice.primary.social_links"
              :key="idx"
              :field="social.platform_url"
              class="group flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition-all duration-200 hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-teal-400"
              :aria-label="social.platform_name ?? 'Social link'"
            >
              <Icon
                v-if="social.platform_icon"
                :name="social.platform_icon"
                class="h-4 w-4"
              />
            </PrismicLink>
          </div>
        </div>

        <!-- Navigation Columns -->
        <div
          v-if="navColumns.length"
          class="grid gap-8 sm:grid-cols-2 lg:col-span-8"
          :class="navColumns.length === 3 ? 'md:grid-cols-3' : navColumns.length === 2 ? 'md:grid-cols-2' : ''"
        >
          <div v-for="(col, idx) in navColumns" :key="idx">
            <h3
              v-if="col.title"
              class="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400"
            >
              {{ col.title }}
            </h3>
            <ul v-if="col.links?.length" class="space-y-2.5">
              <li v-for="link in col.links" :key="link.key">
                <PrismicLink
                  :field="link"
                  class="text-sm text-gray-500 transition-colors duration-150 hover:text-white"
                />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-gray-800" />

      <!-- Bottom Bar -->
      <div
        class="flex flex-col items-center gap-4 py-6 text-xs text-gray-600 md:flex-row md:justify-between"
      >
        <!-- Copyright & Registration -->
        <div class="flex flex-col items-center gap-1 text-center md:items-start md:text-left">
          <p>
            &copy; {{ currentYear }}
            {{ slice.primary.brand_name || 'YBX Labs' }}.
            {{ slice.primary.copyright_text || 'All rights reserved.' }}
          </p>
          <p v-if="slice.primary.registration_number">
            {{ slice.primary.registration_number }}
          </p>
        </div>

        <!-- Bottom Links -->
        <ul
          v-if="slice.primary.bottom_links?.length"
          class="flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
        >
          <li v-for="link in slice.primary.bottom_links" :key="link.key">
            <PrismicLink
              :field="link"
              class="text-gray-600 transition-colors duration-150 hover:text-gray-300"
            />
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
