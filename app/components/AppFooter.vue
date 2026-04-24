<script lang="ts" setup>
const prismic = usePrismic();

const { data: footer } = await useAsyncData("footer", async () => {
  try {
    return await prismic.client.getSingle("footer");
  } catch {
    return null;
  }
});

const currentYear = new Date().getFullYear();

const SITE_DOMAINS = ["ybxlabs.com", "www.ybxlabs.com"];

function toLocalPath(linkField: any): { href: string; external: boolean } {
  if (!linkField?.url) return { href: "#", external: false };
  try {
    const url = new URL(linkField.url);
    if (SITE_DOMAINS.includes(url.hostname)) {
      return { href: url.pathname + url.search + url.hash, external: false };
    }
  } catch {
    if (linkField.url.startsWith("/")) return { href: linkField.url, external: false };
  }
  return { href: linkField.url, external: true };
}

const groupedLinks = computed(() => {
  if (!footer.value?.data?.footer_links?.length) return [];

  const groups: Record<string, { label: string; href: string; external: boolean }[]> = {};
  for (const item of footer.value.data.footer_links) {
    const name = item.group_name || "Links";
    if (!groups[name]) groups[name] = [];
    const resolved = toLocalPath(item.link_url);
    groups[name].push({ label: item.link_label, ...resolved });
  }

  return Object.entries(groups).map(([title, links]) => ({ title, links }));
});

const bottomLinks = computed(() => {
  if (!footer.value?.data?.bottom_links?.length) return [];
  return footer.value.data.bottom_links.map((link: any) => ({
    label: link.label,
    ...toLocalPath(link.url),
  }));
});
</script>

<template>
  <footer class="mt-auto border-t border-gray-800">
    <div class="mx-auto max-w-6xl px-4 md:px-6">
      <!-- Main Footer Content -->
      <div class="py-10 md:py-16">
        <!-- Top row: Brand + Nav side-by-side on desktop -->
        <div class="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <!-- Brand Column -->
          <div class="shrink-0 lg:w-[280px]">
            <NuxtLink to="/" class="inline-block">
              <YBXLabsLogo />
            </NuxtLink>

            <p
              v-if="footer?.data?.tagline"
              class="mt-3 text-sm leading-relaxed text-gray-400"
            >
              {{ footer.data.tagline }}
            </p>

            <!-- Social Icons -->
            <div
              v-if="footer?.data?.social_links?.length"
              class="mt-5 flex flex-wrap items-center gap-2"
            >
              <a
                v-for="(social, idx) in footer.data.social_links"
                :key="idx"
                :href="social.platform_url?.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition-all duration-200 hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-teal-400"
                :aria-label="social.platform_name ?? 'Social link'"
              >
                <Icon
                  v-if="social.platform_icon"
                  :name="social.platform_icon"
                  class="h-3.5 w-3.5"
                />
              </a>
            </div>
          </div>

          <!-- Navigation Columns — always 2-col grid on mobile -->
          <div
            v-if="groupedLinks.length"
            class="grid flex-1 grid-cols-2 gap-x-6 gap-y-8"
            :class="groupedLinks.length >= 3 ? 'md:grid-cols-3' : ''"
          >
            <div v-for="(col, idx) in groupedLinks" :key="idx">
              <h3 class="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                {{ col.title }}
              </h3>
              <ul class="space-y-2">
                <li v-for="(link, linkIdx) in col.links" :key="linkIdx">
                  <NuxtLink
                    v-if="!link.external"
                    :to="link.href"
                    class="text-[13px] text-gray-400 transition-colors duration-150 hover:text-white"
                  >
                    {{ link.label }}
                  </NuxtLink>
                  <a
                    v-else
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-[13px] text-gray-400 transition-colors duration-150 hover:text-white"
                  >
                    {{ link.label }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-gray-800/70" />

      <!-- Bottom Bar -->
      <div class="py-5">
        <!-- Policy links row -->
        <div
          v-if="bottomLinks.length"
          class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]"
          :class="bottomLinks.length > 3 ? 'justify-center md:justify-start' : ''"
        >
          <template v-for="(link, idx) in bottomLinks" :key="idx">
            <NuxtLink
              v-if="!link.external"
              :to="link.href"
              class="text-gray-600 transition-colors duration-150 hover:text-gray-300"
            >
              {{ link.label }}
            </NuxtLink>
            <a
              v-else
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="text-gray-600 transition-colors duration-150 hover:text-gray-300"
            >
              {{ link.label }}
            </a>
          </template>
        </div>

        <!-- Copyright -->
        <div class="mt-3 flex flex-col gap-0.5 text-[11px] text-gray-700 md:flex-row md:items-center md:gap-3">
          <p>
            &copy; {{ currentYear }}
            {{ footer?.data?.brand_name || 'YBX Labs' }}.
            {{ footer?.data?.copyright_text || 'All rights reserved.' }}
          </p>
          <p v-if="footer?.data?.registration_number">
            {{ footer.data.registration_number }}
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
