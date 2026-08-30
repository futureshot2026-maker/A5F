import { getStore } from '@netlify/blobs';

export const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'Cache-Control': 'no-store' }
});

export const env = (key) => process.env[key] || '';

export async function readJson(req) {
  try { return await req.json(); } catch { return {}; }
}

export function cleanJsonText(text) {
  let s = String(text || '').trim();
  if (s.startsWith('```')) s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return s.trim();
}

export async function openaiResponses(input, { model = env('OPENAI_MODEL') || 'gpt-5.6', tools = [], schema = null } = {}) {
  const key = env('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY is not configured.');
  const body = { model, input, tools };
  if (schema) body.text = { format: { type: 'json_schema', name: schema.name, strict: true, schema: schema.schema } };
  const r = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `OpenAI error ${r.status}`);
  return data;
}

export async function transcribeAudio(buffer, filename = 'voice.ogg') {
  const key = env('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY is not configured.');
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);
  form.append('model', env('OPENAI_TRANSCRIPTION_MODEL') || 'gpt-4o-mini-transcribe');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { 'Authorization': `Bearer ${key}` }, body: form
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || `Transcription error ${r.status}`);
  return data.text || '';
}

export async function audit(event) {
  try {
    const store = getStore({ name: 'a5f-manuale-audit', consistency: 'strong' });
    const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomUUID()}`;
    await store.setJSON(id, { ...event, at: new Date().toISOString() });
    return id;
  } catch { return null; }
}

export const DEFAULT_PERMISSIONS = {
  research: 'AUTO', analysis: 'AUTO', website: 'AUTO', outreach: 'APPROVAL',
  negotiation: 'APPROVAL', accept: 'APPROVAL', domain: 'APPROVAL', hosting: 'APPROVAL',
  payment: 'APPROVAL', publish: 'APPROVAL', phone: 'APPROVAL', followup: 'AUTO'
};
