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
