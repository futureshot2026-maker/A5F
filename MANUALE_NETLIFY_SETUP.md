# MANUALE — Netlify production setup

The A5F site is static, so the old PHP endpoints are not the right execution layer on a Netlify deployment. This build adds Netlify Functions under `netlify/functions/` and routes `/api/*` to them.

## Environment variables

Set these in Netlify Project configuration → Environment variables:

- `OPENAI_API_KEY` — required for MANUALE planning, website blueprints and voice transcription.
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6`.
- `OPENAI_TRANSCRIPTION_MODEL` — optional; defaults to `gpt-4o-mini-transcribe`.
- `GOOGLE_MAPS_API_KEY` — required for Business Hunter using Google Places API.
- `META_WHATSAPP_ACCESS_TOKEN` — WhatsApp Cloud API access token.
- `META_WHATSAPP_PHONE_NUMBER_ID` — WhatsApp Business phone number ID.
- `META_WHATSAPP_VERIFY_TOKEN` — any secret verification string you choose.
- `META_APP_SECRET` — Meta app secret, used to validate webhook signatures.

## WhatsApp webhook

Set the Meta webhook callback URL to:
`https://YOUR-DOMAIN/api/whatsapp-webhook`

Verify token: the same value as `META_WHATSAPP_VERIFY_TOKEN`.

Subscribe to the `messages` field.

The webhook accepts owner text and WhatsApp voice notes. Voice notes are downloaded from Meta, transcribed server-side, and passed to MANUALE.

## Safety gates

Research/analysis can be automatic. Outreach, phone calls, negotiation, domain purchases, payments and production publishing stay behind approval rules until the corresponding connector is configured and explicitly permitted.

## What this build does NOT pretend to do

It does not claim that a domain was bought, a payment was made, a customer was contacted, or a site was deployed unless a connected provider returns a success response.

## Deploy

Upload/push the entire project. Netlify detects `netlify/functions` and deploys each function. Netlify documents this model and supports environment variables through the project settings; secrets are read server-side with `process.env`. Do not put API keys into frontend JavaScript.

## First live test

1. Deploy the build.
2. Open `/manuale/` and check **LIVE CONNECTOR STATUS**.
3. Put the OpenAI key in Netlify and redeploy.
4. Run a short command from the MANUALE page.
5. Add Google Places only when Business Hunter is needed.
6. Configure the Meta webhook only after the WhatsApp credentials are in place.

The WhatsApp webhook supports owner text and voice notes. The next production layer is customer conversation state, approval callbacks, domain/hosting providers and a phone-call provider.
