import { json, readJson, env, openaiResponses, cleanJsonText, audit, DEFAULT_PERMISSIONS } from '../lib/common.mjs';

const schema = {
  name: 'manuale_mission',
  schema: {
    type: 'object', additionalProperties: false,
    properties: {
      plan: { type: 'string' }, language: { type: 'string' },
      steps: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
        id: { type: 'string' }, action: { type: 'string' }, mode: { type: 'string', enum: ['AUTO','APPROVAL','BLOCKED'] }, needs: { type: 'string' }
      }, required: ['id','action','mode','needs'] } },
      approvals: { type: 'array', items: { type: 'string' } },
      blocked: { type: 'array', items: { type: 'string' } },
      client_message_draft: { type: 'string' }
    }, required: ['plan','language','steps','approvals','blocked','client_message_draft']
  }
};

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);
  const d = await readJson(req);
  const command = String(d.command || '').trim();
  if (!command) return json({ error: 'Command is required.' }, 400);
  const permissions = { ...DEFAULT_PERMISSIONS, ...(d.permissions || {}) };
  const prompt = `You are MANUALE, A5F's autonomous digital business representative.\n\nOWNER MISSION:\n${command}\n\nPERMISSIONS:\n${JSON.stringify(permissions)}\n\nCreate an auditable mission plan. Research and analysis can be AUTO. Outreach, negotiation, phone calls, purchases, payments, domain registration and production publishing must be APPROVAL unless permissions explicitly say AUTO. BLOCKED means do not perform. Never invent actions or claim execution. Detect the owner's language. If a client_message_draft is useful, write it in the client's likely language; otherwise leave it empty. Keep the plan concise and operational.`;
  try {
    const r = await openaiResponses(prompt, { schema });
    const text = cleanJsonText(r.output_text || '');
    const result = JSON.parse(text);
    const auditId = await audit({ type: 'mission_planned', source: d.source || 'web', command, permissions, result });
    return json({ mode: 'ai', ...result, auditId });
  } catch (e) {
    const auditId = await audit({ type: 'mission_received', source: d.source || 'web', command, permissions, error: e.message });
    return json({ mode: 'configuration_required', plan: 'Mission received, but the AI execution layer is not configured yet.', language: 'unknown', steps: [{ id: '1', action: 'Receive owner mission', mode: 'AUTO', needs: 'MANUALE endpoint' }, { id: '2', action: 'Run AI planning', mode: 'BLOCKED', needs: 'OPENAI_API_KEY' }], approvals: ['External outreach, phone calls, purchases, payments, domains and publishing remain gated.'], blocked: [e.message], client_message_draft: '', auditId }, 200);
  }
};
