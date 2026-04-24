import { Resend } from "resend";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  const { name, email, company, phone, message, token } = body;

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: "Name, email, and message are required." });
  }

  // Verify Cloudflare Turnstile token
  if (config.turnstile?.secretKey) {
    const turnstileRes = await $fetch<{ success: boolean }>(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: {
          secret: config.turnstile.secretKey,
          response: token,
        },
      }
    );

    if (!turnstileRes.success) {
      throw createError({ statusCode: 403, statusMessage: "Bot verification failed. Please try again." });
    }
  }

  // Send email via Resend
  if (!config.resendApiKey) {
    throw createError({ statusCode: 500, statusMessage: "Email service not configured." });
  }

  const resend = new Resend(config.resendApiKey);

  const { error } = await resend.emails.send({
    from: config.contactEmailFrom || "website@ybxlabs.com",
    to: [config.contactEmailTo || "hello@ybxlabs.com"],
    replyTo: email,
    subject: `[Website Contact] ${name}${company ? ` — ${company}` : ""}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px;">
        <h2 style="color: #111;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${escapeHtml(phone)}</td></tr>` : ""}
          ${company ? `<tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${escapeHtml(company)}</td></tr>` : ""}
        </table>
        <div style="padding: 16px; background: #f9f9f9; border-radius: 8px; margin-top: 12px;">
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: "Failed to send email. Please try again." });
  }

  return { success: true };
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
