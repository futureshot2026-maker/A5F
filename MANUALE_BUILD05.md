# A5F MANUALE — Build 05

This build adds a real execution path to the MANUALE control surface.

## New
- `POST /api/manuale-execute` orchestrates planning + research execution.
- Uses OpenAI Responses API with structured JSON output.
- Uses web search for public business research when a location/category is present.
- Returns ranked prospect facts, outreach drafts, approvals, blocked actions and next action.
- Existing permission center remains authoritative.
- Existing WhatsApp webhook remains the owner-channel foundation.

## Required Netlify environment
- `OPENAI_API_KEY` — required for AI planning/research.
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6`.
- `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID`, `META_WHATSAPP_VERIFY_TOKEN`, `META_APP_SECRET` — required for WhatsApp production connection.
- Google Maps key is optional for this build's web-research path; the dedicated Business Hunter endpoint can still use `GOOGLE_MAPS_API_KEY` for Places structured search.

## Safety boundary
Research/analysis can run automatically. Outbound messaging, phone calls, purchases, payments, domain registration and production publishing remain approval-gated unless the owner explicitly changes the permission.
