import { json, env } from '../lib/common.mjs';
export default async () => json({ connectors: {
  openai: !!env('OPENAI_API_KEY'),
  google_places: !!env('GOOGLE_MAPS_API_KEY'),
  whatsapp: !!(env('META_WHATSAPP_ACCESS_TOKEN') && env('META_WHATSAPP_PHONE_NUMBER_ID') && env('META_WHATSAPP_VERIFY_TOKEN')),
  whatsapp_signature: !!env('META_APP_SECRET'),
  audit_store: true
} });
