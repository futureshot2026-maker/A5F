# A5F MANUALE — Autonomous Business Agent / Build 03

This build adds the MANUALE service as the central autonomous-business workflow layer.

## Intended workflow
Owner WhatsApp text/voice -> MANUALE -> research -> qualification -> multilingual conversation -> approved sale -> website/domain/hosting/deployment -> follow-up.

## New production endpoints
- `POST /api/manuale-command.php` — mission planning/orchestration layer.
- `GET/POST /api/manuale-webhook.php` — Meta WhatsApp webhook scaffold.

## Required server credentials for production
- `OPENAI_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `META_WHATSAPP_VERIFY_TOKEN`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- Voice/speech provider credentials
- Domain registrar API credentials
- Hosting/deployment provider credentials
- Payment provider credentials with approval gates

The build does not pretend that external actions occurred when credentials/connectors are missing. Purchases, payments, outbound messaging, calls, domain registration and production publishing remain permission-gated until the real providers are connected.
