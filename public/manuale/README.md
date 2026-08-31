# A5F AI Business Hunter

Production MVP for discovering local businesses, enriching them with Google Places data, analyzing opportunity with the OpenAI Responses API, and preparing personalized outreach.

## Server environment

Set these environment variables on the PHP host:

- `GOOGLE_MAPS_API_KEY`
- `OPENAI_API_KEY`

The server must have PHP cURL enabled.

## Endpoint

`POST /api/business-agent.php`

Example body:

```json
{"location":"Madrid","category":"Restaurants","limit":10}
```

## Important

The prototype intentionally does not write raw Google Places data to `data/`. Use Google Maps Platform attribution and storage rules in production. Outreach is generated but not automatically sent.


## MANUALE persona
MANUALE is the named A5F digital business representative. It is designed to communicate calmly, politely and memorably in Spanish, English, Arabic (Levantine/Shami style), German and Russian. It should listen first, personalize from verified research, avoid pressure/deception, and respect permission gates for commercial actions.

## WhatsApp architecture
WhatsApp is the intended command and client-conversation channel. The current build provides the control surface and command endpoint; a production WhatsApp Business webhook/provider connection is still required before real messages or voice calls are sent.
