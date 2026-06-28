"use server";

/**
 * @file src/app/actions/sendEmail.ts
 *
 * Next.js Server Action — contact form email delivery via Resend.
 *
 * ## Setup
 *   1. Add `RESEND_API_KEY=re_xxxxxxxxx` to `.env.local`
 *      (replace with your real key from https://resend.com/api-keys)
 *   2. `from` is locked to `onboarding@resend.dev` on Resend's free tier.
 *      Once you verify a custom domain, change it to e.g.
 *      `"Portfolio <hello@yourdomain.com>"`.
 *
 * ## Security
 *   • Runs exclusively on the server — the API key is never sent to the client.
 *   • All inputs are trimmed and validated before the Resend call.
 *   • Returns a plain `{ success, error? }` object so the client never sees
 *     raw Resend error details (only a safe user-facing message).
 */

import { Resend } from "resend";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SendEmailPayload {
  name:    string;
  email:   string;
  message: string;
}

export interface SendEmailResult {
  success: boolean;
  /** User-facing error message — safe to display in the UI */
  error?:  string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(payload: SendEmailPayload): string | null {
  const { name, email, message } = payload;
  if (!name.trim())    return "Name is required.";
  if (!email.trim())   return "Email address is required.";
  if (!EMAIL_RE.test(email.trim()))
                       return "Please enter a valid email address.";
  if (!message.trim()) return "Message cannot be empty.";
  if (message.trim().length < 10)
                       return "Message is too short — please write at least 10 characters.";
  return null;
}

/** Escape user-supplied strings before embedding them in HTML */
function escape(str: string): string {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;")
    .replace(/\n/g, "<br />");
}

// ─────────────────────────────────────────────────────────────────────────────
// Action
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmail(
  payload: SendEmailPayload,
): Promise<SendEmailResult> {

  // 1. Validate inputs
  const validationError = validate(payload);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const name    = payload.name.trim();
  const email   = payload.email.trim();
  const message = payload.message.trim();

  // 2. Guard: ensure the env variable is present at runtime
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[sendEmail] RESEND_API_KEY environment variable is not set.");
    return {
      success: false,
      error: "Server configuration error — please contact me directly by email.",
    };
  }

  // 3. Send via Resend
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    /*
     * Free-tier sender — Resend requires this exact address until you
     * verify a custom domain. Change to your own once verified.
     */
    from:    "Portfolio Contact <onboarding@resend.dev>",

    /** Your personal inbox */
    to:      "omaraziz98765@gmail.com",

    subject: `[Portfolio] New message from ${name}`,

    /**
     * reply_to lets you hit "Reply" in your inbox and respond directly
     * to the visitor without copy-pasting their address.
     */
    replyTo: email,

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Portfolio Message</title>
</head>
<body style="margin:0;padding:0;background:#07070d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070d;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0"
          style="background:#0c0c1a;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;max-width:580px;">

          <!-- Header bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#0891b2);padding:4px 0;"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Badge -->
              <div style="display:inline-block;padding:4px 12px;border-radius:999px;
                          background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.3);
                          font-size:11px;font-family:monospace;color:#a78bfa;
                          letter-spacing:0.15em;text-transform:uppercase;margin-bottom:24px;">
                Portfolio Contact
              </div>

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
                New message from ${escape(name)}
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.4);">
                Received ${new Date().toUTCString()}
              </p>

              <!-- Sender info -->
              <table cellpadding="0" cellspacing="0" width="100%"
                style="background:rgba(255,255,255,0.04);border-radius:10px;
                       border:1px solid rgba(255,255,255,0.07);margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <span style="font-size:10px;font-family:monospace;color:rgba(255,255,255,0.3);
                                 text-transform:uppercase;letter-spacing:0.12em;">From</span>
                    <p style="margin:4px 0 0;font-size:14px;color:#fff;">${escape(name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <span style="font-size:10px;font-family:monospace;color:rgba(255,255,255,0.3);
                                 text-transform:uppercase;letter-spacing:0.12em;">Email</span>
                    <p style="margin:4px 0 0;font-size:14px;">
                      <a href="mailto:${escape(email)}"
                         style="color:#7c3aed;text-decoration:none;">${escape(email)}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <p style="font-size:10px;font-family:monospace;color:rgba(255,255,255,0.3);
                        text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">
                Message
              </p>
              <div style="background:rgba(255,255,255,0.04);border-radius:10px;
                          border-left:3px solid #7c3aed;padding:18px 20px;
                          font-size:14px;color:rgba(255,255,255,0.75);line-height:1.7;">
                ${escape(message)}
              </div>

              <!-- CTA -->
              <div style="margin-top:32px;text-align:center;">
                <a href="mailto:${escape(email)}?subject=Re: Your portfolio message"
                   style="display:inline-block;padding:12px 28px;border-radius:10px;
                          background:linear-gradient(135deg,#7c3aed,#0891b2);
                          color:#fff;font-size:14px;font-weight:600;text-decoration:none;">
                  Reply to ${escape(name)} →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;font-size:11px;font-family:monospace;
                        color:rgba(255,255,255,0.2);text-align:center;">
                Sent via your portfolio contact form · omar-ahmad.dev
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  // 4. Surface Resend-level errors (rate limits, invalid address, etc.)
  if (error) {
    console.error("[sendEmail] Resend API error:", error);
    return {
      success: false,
      error: "Failed to deliver your message — please try again in a moment.",
    };
  }

  return { success: true };
}
