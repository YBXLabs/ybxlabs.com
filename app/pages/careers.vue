<script setup lang="ts">
const prismic = usePrismic();

const { data: page } = await useAsyncData("careers-page", async () => {
  try {
    return await prismic.client.getSingle("careers");
  } catch {
    return null;
  }
});

const d = computed(() => page.value?.data);

useSeoMeta({
  title: () => d.value?.meta_title || "Careers | YBX Labs",
  description: () => d.value?.meta_description || "Join the YBX Labs team.",
});

const activeOpenings = computed(() =>
  (d.value?.job_openings ?? []).filter((j: any) => j.is_active !== false)
);

const expandedIdx = ref<number | null>(null);
const applyingJob = ref<any>(null);

function toggle(idx: number) {
  expandedIdx.value = expandedIdx.value === idx ? null : idx;
}

function openApplyModal(job: any) {
  applyingJob.value = job;
}

function closeApplyModal() {
  applyingJob.value = null;
}

const telegramUrl = computed(() => d.value?.telegram_url?.url || "https://t.me/yesbhautik");

const telegramMessage = computed(() => {
  if (!applyingJob.value) return "";
  const title = applyingJob.value.job_title || "a position";
  return encodeURIComponent(
    `Hi! I'd like to apply for "${title}" at YBX Labs.\n\nHere are my details:\n\n` +
    `🎥 Intro Video: [link]\n` +
    `💼 LinkedIn: [link]\n` +
    `🐙 GitHub: [link]\n` +
    `🐦 X/Twitter: [link]\n` +
    `📄 Resume: [link]\n` +
    `📌 Anything else: [link or info]`
  );
});

const telegramApplyLink = computed(() =>
  `${telegramUrl.value}?text=${telegramMessage.value}`
);

interface DescBlock {
  type: "heading" | "paragraph" | "list";
  text?: string;
  items?: string[];
}

function parseDescription(field: any[]): DescBlock[] {
  if (!field?.length) return [];
  const blocks: DescBlock[] = [];
  let currentList: string[] | null = null;

  for (const node of field) {
    if (node.type === "list-item" || node.type === "o-list-item") {
      if (!currentList) currentList = [];
      currentList.push(node.text);
    } else {
      if (currentList) {
        blocks.push({ type: "list", items: currentList });
        currentList = null;
      }
      if (node.type === "heading2" || node.type === "heading3") {
        blocks.push({ type: "heading", text: node.text });
      } else if (node.type === "paragraph" && node.text) {
        blocks.push({ type: "paragraph", text: node.text });
      }
    }
  }
  if (currentList) {
    blocks.push({ type: "list", items: currentList });
  }
  return blocks;
}
</script>

<template>
  <main>
    <Bounded>
      <div class="w-full max-w-4xl">
        <h1 class="text-4xl font-medium md:text-5xl">
          {{ d?.heading || "Careers" }}
        </h1>
        <p class="mt-4 max-w-2xl text-lg text-gray-400">
          {{ d?.subtitle || "Build the future with us." }}
        </p>

        <!-- Perks -->
        <div v-if="d?.perks?.length" class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(perk, idx) in d.perks"
            :key="idx"
            class="rounded-xl border border-gray-800 bg-gray-900/30 p-5"
          >
            <Icon v-if="perk.icon" :name="perk.icon" class="h-7 w-7 text-teal-400" />
            <p class="mt-3 text-sm font-medium text-white">{{ perk.title }}</p>
            <p class="mt-1 text-xs text-gray-500">{{ perk.description }}</p>
          </div>
        </div>

        <!-- Openings -->
        <section class="mt-16">
          <h2 class="text-2xl font-medium">Open Positions</h2>

          <div v-if="activeOpenings.length" class="mt-6 space-y-3">
            <div
              v-for="(job, idx) in activeOpenings"
              :key="idx"
              class="rounded-xl border border-gray-800 bg-gray-900/20 transition-colors hover:border-gray-700"
            >
              <button
                class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                @click="toggle(idx)"
              >
                <div class="min-w-0">
                  <h3 class="text-lg font-medium text-white">{{ job.job_title }}</h3>
                  <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span v-if="job.department">{{ job.department }}</span>
                    <span v-if="job.location">{{ job.location }}</span>
                    <span v-if="job.employment_type" class="rounded-full border border-gray-800 px-2 py-0.5 text-gray-400">
                      {{ job.employment_type }}
                    </span>
                    <span v-if="job.experience">{{ job.experience }}</span>
                  </div>
                </div>
                <Icon
                  name="ph:caret-down"
                  class="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200"
                  :class="{ 'rotate-180': expandedIdx === idx }"
                />
              </button>

              <div
                v-if="expandedIdx === idx"
                class="border-t border-gray-800/50 px-6 pb-6 pt-4"
              >
                <div v-if="job.job_description?.length" class="space-y-4">
                  <template v-for="(block, bIdx) in parseDescription(job.job_description)" :key="bIdx">
                    <h4
                      v-if="block.type === 'heading'"
                      class="text-sm font-semibold uppercase tracking-wide text-teal-400"
                      :class="{ 'mt-0': bIdx === 0, 'mt-5': bIdx > 0 }"
                    >
                      {{ block.text }}
                    </h4>
                    <p
                      v-else-if="block.type === 'paragraph'"
                      class="text-sm leading-relaxed text-gray-400"
                    >
                      {{ block.text }}
                    </p>
                    <ul v-else-if="block.type === 'list'" class="space-y-1.5 pl-1">
                      <li
                        v-for="(item, iIdx) in block.items"
                        :key="iIdx"
                        class="flex items-start gap-2.5 text-sm leading-relaxed text-gray-400"
                      >
                        <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-500" />
                        {{ item }}
                      </li>
                    </ul>
                  </template>
                </div>
                <button
                  class="buttonLink mt-6 inline-flex !rounded-lg !px-5 !py-2.5 text-sm"
                  @click="openApplyModal(job)"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          <div v-else class="mt-6 rounded-xl border border-gray-800 bg-gray-900/20 p-8 text-center">
            <Icon name="ph:briefcase-duotone" class="mx-auto h-10 w-10 text-gray-600" />
            <p class="mt-3 text-gray-500">No open positions right now. Check back soon!</p>
          </div>
        </section>

        <!-- Open application -->
        <section class="mt-12 rounded-xl border border-gray-800/50 bg-gray-900/10 p-8">
          <h3 class="text-lg font-medium">Don't see a perfect fit?</h3>
          <p class="mt-2 text-sm text-gray-400">
            {{ d?.open_application_text || "We're always open to hearing from exceptional people." }}
            Send your pitch and links to us on
            <a
              :href="telegramUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-teal-400 hover:text-teal-300 transition-colors"
            >
              Telegram
            </a>
            <template v-if="d?.careers_email">
              or email
              <span class="text-teal-400">{{ d.careers_email }}</span>
            </template>
          </p>
        </section>
      </div>
    </Bounded>

    <!-- Apply Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="applyingJob"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeApplyModal"
        >
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="closeApplyModal" />

          <div class="relative z-10 w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl md:p-8">
            <button
              class="absolute right-4 top-4 text-gray-600 hover:text-white transition-colors"
              @click="closeApplyModal"
              aria-label="Close"
            >
              <Icon name="ph:x-bold" class="h-5 w-5" />
            </button>

            <h3 class="text-xl font-medium text-white">
              Apply for {{ applyingJob.job_title }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ applyingJob.department }}
              <span v-if="applyingJob.location"> · {{ applyingJob.location }}</span>
            </p>

            <div class="mt-6 space-y-5">
              <div class="flex gap-3">
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-semibold text-teal-400">1</div>
                <div>
                  <p class="text-sm font-medium text-white">Record a short intro video</p>
                  <p class="mt-1 text-xs text-gray-500">
                    A quick pitch about yourself — who you are, what excites you about this role,
                    and why you'd be a great fit. Keep it under <strong class="text-gray-400">3 minutes</strong>.
                    Upload it anywhere (YouTube unlisted, Loom, Google Drive, etc.) and have the link ready.
                  </p>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-semibold text-teal-400">2</div>
                <div>
                  <p class="text-sm font-medium text-white">Prepare your links</p>
                  <div class="mt-2 space-y-1.5 text-xs text-gray-500">
                    <div class="flex items-center gap-2">
                      <Icon name="simple-icons:linkedin" class="h-3.5 w-3.5 text-gray-600" />
                      <span>LinkedIn profile <span class="text-gray-600">*</span></span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="simple-icons:x" class="h-3.5 w-3.5 text-gray-600" />
                      <span>X (Twitter) profile <span class="text-gray-600">*</span></span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="simple-icons:github" class="h-3.5 w-3.5 text-gray-600" />
                      <span>GitHub profile</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="ph:file-text" class="h-3.5 w-3.5 text-gray-600" />
                      <span>Resume / CV link</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Icon name="ph:link-simple" class="h-3.5 w-3.5 text-gray-600" />
                      <span>Anything else we should see (portfolio, blog, etc.)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-semibold text-teal-400">3</div>
                <div>
                  <p class="text-sm font-medium text-white">Send it over on Telegram</p>
                  <p class="mt-1 text-xs text-gray-500">
                    Click the button below — it'll open Telegram with a pre-filled
                    message template. Just replace the [link] placeholders with your actual links and hit send.
                  </p>
                </div>
              </div>
            </div>

            <a
              :href="telegramApplyLink"
              target="_blank"
              rel="noopener noreferrer"
              class="buttonLink mt-8 flex w-full items-center justify-center gap-2 !rounded-lg !py-3 text-sm font-medium"
            >
              <Icon name="simple-icons:telegram" class="h-4 w-4" />
              Open Telegram & Apply
            </a>

            <p v-if="d?.careers_email" class="mt-3 text-center text-[11px] text-gray-700">
              Prefer email? Send everything to {{ d.careers_email }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
