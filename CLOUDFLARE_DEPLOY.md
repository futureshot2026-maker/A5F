# A5F MANUALE — Cloudflare Worker Build 08

This build is prepared for **Cloudflare Workers + Static Assets**.

## Important
Do **not** use Cloudflare's "Upload your static files" screen for this project. That screen is for static assets and will reject a project containing `wrangler.jsonc`.

Deploy the project with Wrangler:

```bash
npm install
npx wrangler login
npx wrangler deploy
```

Cloudflare deploys the Worker (`worker.js`) and the website files in `public/` together.

## WhatsApp connection

The Worker exposes:

- `POST /api/manuale-webhook`
- `POST /api/manuale-webhook.php`
- `GET /api/manuale-webhook` (Meta verification)
- `POST /api/manuale-command`
- `POST /api/manuale-execute`
- `GET /api/health`

Set these Worker secrets/variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `OPENAI_TRANSCRIPTION_MODEL` (optional)
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_VERIFY_TOKEN`
- `META_OWNER_WHATSAPP_NUMBER` (digits only, country code included)
- `META_APP_SECRET`

The webhook accepts WhatsApp text and voice messages. Voice notes are transcribed and passed to MANUALE.

The webhook is owner-gated: only `META_OWNER_WHATSAPP_NUMBER` is processed.

## Meta webhook URL

After deployment, use:

`https://YOUR-WORKER-DOMAIN/api/manuale-webhook`

or the `.php` alias.

The Meta verification token must exactly equal `META_WHATSAPP_VERIFY_TOKEN`.

## Build 08 fixes

- Static website moved to `public/` so it is not mixed with Worker/server files.
- Wrangler assets binding now points to `./public`.
- API routes are forced through the Worker with `run_worker_first`.
- MANUALE web console now works with `/api/manuale-execute`.
- WhatsApp webhook validates `X-Hub-Signature-256` when `META_APP_SECRET` is configured.
- Added deploy/dev scripts to `package.json`.
- Removed Netlify dependency from the Cloudflare deployment package.

## Safety

The AI can plan and analyze, but external commercial messaging, negotiation, purchases, payments, domain registration and production publishing remain approval-gated unless you explicitly configure otherwise.
