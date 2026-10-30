/**
 * POST /api/inquiry — Cloudflare Pages Function (packet sections 5, 10, 19).
 *
 * Verifies Turnstile, validates server-side, rate limits, drops duplicate
 * submissions, and delivers the lead to the Owner's Microsoft 365 mailbox via
 * Microsoft Graph. No lead data is stored by a third-party form vendor.
 *
 * Secrets (set by the Owner in Cloudflare, never committed):
 *   TURNSTILE_SECRET      Turnstile secret key
 *   GRAPH_TENANT_ID       Entra tenant ID
 *   GRAPH_CLIENT_ID       App registration with Mail.Send (scoped to the mailbox
 *   GRAPH_CLIENT_SECRET   via an application access policy)
 *   MAIL_SENDER           Mailbox that sends, e.g. leads@nightrounds.example
 *   MAIL_TO               Mailbox that receives
 * Optional bindings:
 *   RATE_LIMITER          Workers rate limiting binding (e.g. 5 requests / 60s)
 *   LEADS_KV              KV namespace used only to remember recent submission IDs
 *
 * Logs contain status and a correlation ID only, never message bodies.
 */

const KINDS = new Set(['inquiry', 'checklist', 'assessment']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = { name: 120, email: 200, organization: 160, phone: 40, message: 2000 };

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost({ request, env }) {
  const id = crypto.randomUUID();
  const log = (status, extra = {}) => console.log(JSON.stringify({ id, status, ...extra }));
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

  if (env.RATE_LIMITER) {
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) {
      log('rate_limited');
      return json(429, { error: 'Too many requests. Please wait a minute and try again.' });
    }
  }

  let data;
  try {
    data = await request.json();
  } catch {
    log('bad_json');
    return json(400, { error: 'Invalid request.' });
  }

  // Honeypot filled: accept silently so bots learn nothing.
  if (data.company_site) {
    log('honeypot');
    return json(200, { ok: true });
  }

  const kind = KINDS.has(data.kind) ? data.kind : 'inquiry';
  const clean = {};
  for (const [field, max] of Object.entries(LIMITS)) {
    clean[field] = String(data[field] ?? '').trim().slice(0, max);
  }

  const fields = {};
  if (!clean.name) fields.name = 'Please enter your name.';
  if (!EMAIL.test(clean.email)) fields.email = 'Please enter a valid work email.';
  if (kind !== 'checklist' && !clean.organization) fields.organization = 'Please enter your organization.';
  if (Object.keys(fields).length) {
    log('invalid', { fields: Object.keys(fields) });
    return json(422, { fields });
  }

  if (env.TURNSTILE_SECRET) {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', String(data['cf-turnstile-response'] ?? ''));
    form.append('remoteip', ip);
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const outcome = await verify.json();
    if (!outcome.success) {
      log('bot_check_failed');
      return json(403, { error: 'The bot check did not pass. Please reload the page and try again.' });
    }
  }

  const submissionId = String(data.submissionId ?? '').slice(0, 64);
  if (env.LEADS_KV && submissionId) {
    if (await env.LEADS_KV.get(`sub:${submissionId}`)) {
      log('duplicate');
      return json(200, { ok: true, duplicate: true });
    }
  }

  try {
    await sendMail(env, kind, clean, id);
  } catch (err) {
    log('mail_failed', { reason: String(err?.message ?? err).slice(0, 200) });
    return json(502, { error: 'We could not deliver your message. Please try again.' });
  }

  if (env.LEADS_KV && submissionId) {
    await env.LEADS_KV.put(`sub:${submissionId}`, '1', { expirationTtl: 60 * 60 * 24 });
  }
  log('delivered', { kind });
  return json(200, { ok: true });
}

export const onRequest = () => json(405, { error: 'Method not allowed.' });

async function sendMail(env, kind, f, id) {
  const tokenRes = await fetch(`https://login.microsoftonline.com/${env.GRAPH_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: env.GRAPH_CLIENT_ID,
      client_secret: env.GRAPH_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  });
  if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}`);
  const { access_token } = await tokenRes.json();

  const subject = {
    inquiry: 'Website inquiry',
    assessment: 'Assessment request',
    checklist: 'Checklist download',
  }[kind];

  const lines = [
    `Type: ${subject}`,
    `Name: ${f.name}`,
    `Work email: ${f.email}`,
    f.organization && `Organization: ${f.organization}`,
    f.phone && `Phone: ${f.phone}`,
    f.message && `\nMessage:\n${f.message}`,
    `\nReference: ${id}`,
  ].filter(Boolean);

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.MAIL_SENDER)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: `${subject}: ${f.organization || f.name}`,
        body: { contentType: 'Text', content: lines.join('\n') },
        toRecipients: [{ emailAddress: { address: env.MAIL_TO } }],
        replyTo: [{ emailAddress: { address: f.email, name: f.name } }],
      },
      saveToSentItems: true,
    }),
  });
  if (!res.ok) throw new Error(`graph ${res.status}`);
}
