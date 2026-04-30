<script setup lang="ts">
const prismic = usePrismic();

const { data: page } = await useAsyncData("contact-page", async () => {
  try {
    return await prismic.client.getSingle("contact");
  } catch {
    return null;
  }
});

const d = computed(() => page.value?.data);

useSeoMeta({
  title: () => d.value?.meta_title || "Contact Us | YBX Labs",
  description: () => d.value?.meta_description || "Get in touch with the YBX Labs team.",
});

const form = reactive({
  name: "",
  email: "",
  company: "",
  phone: "",
  message: "",
});

const turnstileToken = ref("");
const status = ref<"idle" | "sending" | "success" | "error">("idle");
const errorMsg = ref("");
const copiedField = ref("");

async function handleSubmit() {
  if (!form.name || !form.email || !form.message) return;

  status.value = "sending";
  errorMsg.value = "";

  try {
    await $fetch("/api/contact", {
      method: "POST",
      body: { ...form, token: turnstileToken.value },
    });
    status.value = "success";
    Object.assign(form, { name: "", email: "", company: "", phone: "", message: "" });
  } catch (err: any) {
    status.value = "error";
    errorMsg.value = err?.data?.statusMessage || "Something went wrong. Please try again.";
  }
}

async function copyToClipboard(text: string, field: string) {
  try {
    await navigator.clipboard.writeText(text);
    copiedField.value = field;
    setTimeout(() => { copiedField.value = ""; }, 2000);
  } catch {}
}
</script>

<template>
  <main>
    <Bounded>
      <div class="w-full max-w-5xl">
        <h1 class="text-4xl font-medium md:text-5xl">
          {{ d?.heading || "Contact Us" }}
        </h1>
        <p class="mt-4 max-w-2xl text-lg text-gray-400">
          {{ d?.subtitle || "Fill out the form and we'll get back to you." }}
        </p>

        <div class="mt-12 grid gap-12 lg:grid-cols-5">
          <!-- Form -->
          <div class="lg:col-span-3">
            <form
              v-if="status !== 'success'"
              class="space-y-5"
              @submit.prevent="handleSubmit"
            >
              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label for="name" class="mb-1.5 block text-sm text-gray-400">Name *</label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Your name"
                    class="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label for="email" class="mb-1.5 block text-sm text-gray-400">Email *</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    class="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label for="company" class="mb-1.5 block text-sm text-gray-400">Company</label>
                  <input
                    id="company"
                    v-model="form.company"
                    type="text"
                    placeholder="Your company"
                    class="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label for="phone" class="mb-1.5 block text-sm text-gray-400">Phone</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    class="w-full rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label for="message" class="mb-1.5 block text-sm text-gray-400">Message *</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  required
                  rows="5"
                  placeholder="Tell us about your project, timeline, and budget..."
                  class="w-full resize-none rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
                />
              </div>

              <NuxtTurnstile v-model="turnstileToken" />

              <p v-if="status === 'error'" class="text-sm text-red-400">{{ errorMsg }}</p>

              <button
                type="submit"
                :disabled="status === 'sending'"
                class="buttonLink !rounded-lg !px-6 !py-3 text-sm font-medium disabled:opacity-50"
              >
                {{ status === 'sending' ? 'Sending...' : 'Send Message' }}
              </button>
            </form>

            <!-- Success State -->
            <div v-else class="rounded-xl border border-teal-500/20 bg-teal-500/5 p-8 text-center">
              <Icon name="ph:check-circle-fill" class="mx-auto h-12 w-12 text-teal-400" />
              <h3 class="mt-4 text-xl font-medium text-white">Message Sent!</h3>
              <p class="mt-2 text-gray-400">
                Thanks for reaching out. We'll get back to you within 24 hours.
              </p>
              <button
                class="mt-6 text-sm text-teal-400 hover:text-teal-300"
                @click="status = 'idle'"
              >
                Send another message
              </button>
            </div>
          </div>

          <!-- Contact Details (all from Prismic) -->
          <div class="space-y-8 lg:col-span-2">
            <!-- Email -->
            <div v-if="d?.email">
              <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-400">Email</h3>
              <button
                class="group mt-2 flex items-center gap-2 text-lg text-white transition-colors hover:text-teal-300"
                @click="copyToClipboard(d.email, 'email')"
              >
                <span>{{ d.email }}</span>
                <Icon
                  :name="copiedField === 'email' ? 'ph:check-bold' : 'ph:copy'"
                  class="h-4 w-4 text-gray-600 transition-colors group-hover:text-teal-400"
                  :class="{ '!text-teal-400': copiedField === 'email' }"
                />
              </button>
              <p v-if="copiedField === 'email'" class="mt-1 text-xs text-teal-500">Copied!</p>
            </div>

            <!-- Telegram -->
            <div v-if="d?.telegram_handle">
              <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-400">Telegram</h3>
              <button
                class="group mt-2 flex items-center gap-2 text-lg text-white transition-colors hover:text-teal-300"
                @click="copyToClipboard(d.telegram_handle, 'telegram')"
              >
                <span>{{ d.telegram_handle }}</span>
                <Icon
                  :name="copiedField === 'telegram' ? 'ph:check-bold' : 'ph:copy'"
                  class="h-4 w-4 text-gray-600 transition-colors group-hover:text-teal-400"
                  :class="{ '!text-teal-400': copiedField === 'telegram' }"
                />
              </button>
              <p v-if="copiedField === 'telegram'" class="mt-1 text-xs text-teal-500">Copied!</p>
            </div>

            <!-- Social Links -->
            <div v-if="d?.social_links?.length">
              <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-400">Social</h3>
              <div class="mt-3 flex flex-wrap gap-2">
                <a
                  v-for="(social, idx) in d.social_links"
                  :key="idx"
                  :href="social.platform_url?.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition-all hover:border-teal-500/30 hover:text-teal-400"
                  :aria-label="social.platform_name || 'Social'"
                >
                  <Icon v-if="social.platform_icon" :name="social.platform_icon" class="h-4 w-4" />
                </a>
              </div>
            </div>

            <!-- Phone & Address — only shown when toggle is ON (for verification) -->
            <div v-if="d?.show_contact_details">
              <!-- Phone -->
              <div v-if="d?.phone_number" class="mb-5">
                <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-400">Phone</h3>
                <button
                  class="group mt-2 flex items-center gap-2 text-lg text-white transition-colors hover:text-teal-300"
                  @click="copyToClipboard(d.phone_number, 'phone')"
                >
                  <span>{{ d.phone_number }}</span>
                  <Icon
                    :name="copiedField === 'phone' ? 'ph:check-bold' : 'ph:copy'"
                    class="h-4 w-4 text-gray-600 transition-colors group-hover:text-teal-400"
                    :class="{ '!text-teal-400': copiedField === 'phone' }"
                  />
                </button>
                <p v-if="copiedField === 'phone'" class="mt-1 text-xs text-teal-500">Copied!</p>
              </div>

              <!-- Address -->
              <div v-if="d?.address" class="mb-5">
                <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-400">Address</h3>
                <div class="mt-2 text-lg leading-relaxed text-white">
                  <PrismicRichText :field="d.address" />
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-px bg-gray-800"></div>

            <!-- Response Time -->
            <div v-if="d?.response_time_text" class="pt-2">
              <h3 class="text-sm font-semibold uppercase tracking-widest text-gray-400">Response Time</h3>
              <p class="mt-2 text-sm text-gray-500">{{ d.response_time_text }}</p>
            </div>
          </div>
        </div>
      </div>
    </Bounded>

    <!-- Address — exists in source only, invisible to users -->
    <div v-if="d?.address_text" aria-hidden="true" class="pointer-events-none select-none overflow-hidden" style="height: 0; opacity: 0;">
      <span>{{ d.address_text }}</span>
    </div>
  </main>
</template>
