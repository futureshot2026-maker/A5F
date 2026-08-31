const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(data, status=200) { return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS }); }
function env(env, key) { return env[key] || ''; }
async function readJson(req) { try { return await req.json(); } catch { return {}; } }
function outputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text) return data.output_text;
  let text = '';
  for (const item of (data?.output || [])) for (const c of (item?.content || [])) if (c?.type === 'output_text') text += c.text || '';
  return text.trim();
}
async function openai(env, input, extra={}) {
  const key = env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured.');
  const payload = { model: env.OPENAI_MODEL || 'gpt-5.6', input, ...extra };
  const r = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'content-type':'application/json','authorization':`Bearer ${key}`}, body:JSON.stringify(payload) });
  const data = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(data?.error?.message || `OpenAI error ${r.status}`);
  return data;
}

const MANUALE_SYSTEM = `You are MANUALE, A5F's autonomous digital business representative and owner's executive assistant.
Turn owner commands into safe, auditable execution plans. You can research local businesses, analyze websites/ratings/reviews, qualify prospects, prepare personalized outreach, manage CRM, create website projects, and coordinate fulfillment.
Never invent facts. Never claim an external action happened unless a connected tool confirms it. Outbound commercial messages, phone calls, negotiation, purchases, payments, account creation, domain registration and production publishing are APPROVAL unless permissions explicitly allow AUTO. Respect privacy, anti-spam and platform rules.
Persona: calm, gentle, polished, persuasive without pressure. Detect the client's language and use Spanish, English, German, Russian, or Arabic; for Arabic default to warm Levantine/Shami. Never pretend to be human; identify as MANUALE, A5F's digital business representative.
Return concise JSON: {"plan":string,"steps":[{"id":string,"action":string,"mode":"AUTO|APPROVAL|BLOCKED","needs":string}],"approvals":string[],"tools":string[],"blocked":string[],"language":string,"client_message_draft":string}.`;

async function manualeCommand(body, env) {
  const command = String(body.command || '').trim();
  if (!command) throw new Error('Command is required.');
  const permissions = body.permissions || {};
  const input = `${MANUALE_SYSTEM}\nOWNER COMMAND:\n${command}\nPERMISSIONS:\n${JSON.stringify(permissions)}`;
  const data = await openai(env, input);
  return { mode:'ai', plan:outputText(data), source:body.source || 'web' };
}

async function businessAgent(body, env) {
  const location = String(body.location || '').trim();
  const category = String(body.category || 'Restaurants').trim();
  const limit = Math.max(1, Math.min(20, Number(body.limit || 10)));
  if (!location) throw new Error('Location is required.');
  const google = env.GOOGLE_MAPS_API_KEY;
  if (!google) throw new Error('GOOGLE_MAPS_API_KEY is not configured.');
  const search = await fetch('https://places.googleapis.com/v1/places:searchText', { method:'POST', headers:{'content-type':'application/json','x-goog-api-key':google,'x-goog-fieldmask':'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.nationalPhoneNumber,places.primaryType,places.businessStatus,places.currentOpeningHours'}, body:JSON.stringify({textQuery:`${category} in ${location}, Spain`,languageCode:'en',regionCode:'ES',pageSize:limit}) });
  const searchData = await search.json().catch(()=>({}));
  if (!search.ok) throw new Error(searchData?.error?.message || `Google Places error ${search.status}`);
  const places = searchData.places || [];
  const compact = places.map(p => ({ id:p.id||'', name:p.displayName?.text||'', address:p.formattedAddress||'', rating:p.rating??null, reviewCount:p.userRatingCount||0, website:p.websiteUri||'', maps:p.googleMapsUri||'', phone:p.nationalPhoneNumber||'', type:p.primaryType||category, status:p.businessStatus||'' }));
  const instructions = `You are A5F Business Hunter AI. Rank these public business records for website/digital transformation opportunities. Missing website is a strong signal. Do not invent facts. Use only supplied data plus general reasoning. Return JSON only: {"summary":{"total":number,"hot":number,"warm":number},"prospects":[{"name":string,"category":string,"address":string,"rating":number|null,"reviewCount":number,"score":number,"priority":"VERY HOT"|"HOT"|"WARM"|"LOW","summary":string,"reasons":string[],"recommendation":string,"outreach":string}]}. Outreach must be concise Spanish, personalized, non-deceptive and framed as an offer to show an audit/prototype. Do not claim contact already occurred.`;
  const data = await openai(env, `${instructions}\nMarket: ${location}\nCategory: ${category}\nBusinesses:\n${JSON.stringify(compact)}`, { tools:[{type:'web_search'}] });
  let text = outputText(data).replace(/^```json\s*/,'').replace(/\s*```$/,'').trim();
  let result; try { result=JSON.parse(text); } catch { throw new Error('AI returned an invalid business analysis.'); }
  return {...result, location, category};
}

async function sendWhatsApp(env, to, text) {
  const token=env.META_WHATSAPP_ACCESS_TOKEN, phoneId=env.META_WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error('WhatsApp credentials are not configured.');
  const r=await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`, { method:'POST', headers:{'content-type':'application/json','authorization':`Bearer ${token}`}, body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:text}}) });
  const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d?.error?.message||`WhatsApp error ${r.status}`); return d;
}
async function transcribeAudio(env, bytes, mime='audio/ogg') {
  const key=env.OPENAI_API_KEY; if(!key) throw new Error('OPENAI_API_KEY is not configured.');
  const form=new FormData(); form.append('file',new File([bytes],'voice.ogg',{type:mime})); form.append('model',env.OPENAI_TRANSCRIPTION_MODEL||'gpt-4o-mini-transcribe');
  const r=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{authorization:`Bearer ${key}`},body:form}); const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d?.error?.message||`Transcription error ${r.status}`); return d.text||'';
}


async function verifyMetaSignature(req, rawBody, appSecret) {
  if (!appSecret) return true; // Signature validation is enabled automatically when META_APP_SECRET is set.
  const header = req.headers.get('x-hub-signature-256') || '';
  if (!header.startsWith('sha256=')) return false;
  const hex = header.slice(7);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(appSecret),
    { name:'HMAC', hash:'SHA-256' },
    false,
    ['sign']
  );
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody)));
  let expected = '';
  for (const b of mac) expected += b.toString(16).padStart(2,'0');
  return expected === hex;
}

async function handleWebhook(req, env, url) {
  if (req.method==='GET') {
    const mode=url.searchParams.get('hub.mode'), token=url.searchParams.get('hub.verify_token'), challenge=url.searchParams.get('hub.challenge');
    if(mode==='subscribe' && token && token===env.META_WHATSAPP_VERIFY_TOKEN) return new Response(challenge,{status:200,headers:{'content-type':'text/plain'}});
    return json({error:'Verification failed'},403);
  }
  const rawBody = await req.text();
  if (!(await verifyMetaSignature(req, rawBody, env.META_APP_SECRET))) return json({error:'Invalid Meta signature'},401);
  let body={}; try { body=JSON.parse(rawBody); } catch { return json({error:'Invalid JSON'},400); }
  const msg=body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if(!msg) return json({received:true,status:'ignored'});
  const from=String(msg.from||'');
  const owner=String(env.META_OWNER_WHATSAPP_NUMBER||'').replace(/\D/g,'');
  if(owner && from.replace(/\D/g,'')!==owner) return json({received:true,status:'ignored_non_owner'});
  let command='';
  if(msg.type==='text') command=msg.text?.body||'';
  else if(msg.type==='audio') {
    const token=env.META_WHATSAPP_ACCESS_TOKEN;
    const media=await fetch(`https://graph.facebook.com/v23.0/${msg.audio.id}`,{headers:{authorization:`Bearer ${token}`}}).then(r=>r.json());
    const bytes=await fetch(media.url,{headers:{authorization:`Bearer ${token}`}}).then(r=>r.arrayBuffer());
    command=await transcribeAudio(env,bytes,msg.audio.mime_type||'audio/ogg');
  }
  if(!command) return json({received:true,status:'unsupported_message'});
  const result=await manualeCommand({command,source:'whatsapp',permissions:{owner:true}},env);
  const reply=`MANUALE\n\n${result.plan}`.slice(0,4000);
  await sendWhatsApp(env,from,reply);
  return json({received:true,status:'processed',command,result});
}

export default { async fetch(req, env) {
  if (req.method==='OPTIONS') return new Response(null,{status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-hub-signature-256'}});
  const url=new URL(req.url);
  try {
    if(url.pathname==='/api/manuale-command.php' || url.pathname==='/api/agent-command.php' || url.pathname==='/api/manuale-command' || url.pathname==='/api/manuale-execute') return json(await manualeCommand(await readJson(req),env));
    if(url.pathname==='/api/business-agent.php' || url.pathname==='/api/business-agent') return json(await businessAgent(await readJson(req),env));
    if(url.pathname==='/api/manuale-webhook.php' || url.pathname==='/api/manuale-webhook') return await handleWebhook(req,env,url);
    if(url.pathname==='/api/health') return json({ok:true,service:'A5F MANUALE',runtime:'cloudflare-workers'});
    return env.ASSETS ? env.ASSETS.fetch(req) : new Response('A5F MANUALE',{status:200});
  } catch(e) { return json({error:e?.message||'MANUALE execution error'},500); }
}};
