import crypto from 'node:crypto';
import { json, env, openaiResponses, transcribeAudio, audit } from '../lib/common.mjs';

function verifySignature(raw, signature) {
  const secret=env('META_APP_SECRET'); if(!secret) return true;
  if(!signature?.startsWith('sha256=')) return false;
  const expected='sha256='+crypto.createHmac('sha256',secret).update(raw).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature));
}
async function sendWhatsApp(to,text){
  const token=env('META_WHATSAPP_ACCESS_TOKEN'), phoneId=env('META_WHATSAPP_PHONE_NUMBER_ID');
  if(!token||!phoneId) throw new Error('WhatsApp credentials are not configured.');
  const r=await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{preview_url:false,body:text}})});
  const j=await r.json(); if(!r.ok) throw new Error(j?.error?.message||'WhatsApp send failed'); return j;
}
async function getMedia(mediaId){
  const token=env('META_WHATSAPP_ACCESS_TOKEN');
  const r=await fetch(`https://graph.facebook.com/v23.0/${mediaId}`,{headers:{Authorization:`Bearer ${token}`}}); const meta=await r.json(); if(!r.ok) throw new Error(meta?.error?.message||'Media lookup failed');
  const b=await fetch(meta.url,{headers:{Authorization:`Bearer ${token}`}}); if(!b.ok) throw new Error('Media download failed'); return Buffer.from(await b.arrayBuffer());
}

export default async (req)=>{
  if(req.method==='GET'){
    const u=new URL(req.url); if(u.searchParams.get('hub.verify_token')===env('META_WHATSAPP_VERIFY_TOKEN')) return new Response(u.searchParams.get('hub.challenge')||'',{status:200});
    return json({error:'Verification failed'},403);
  }
  if(req.method!=='POST') return json({error:'POST required'},405);
  const raw=await req.text(); if(!verifySignature(raw,req.headers.get('x-hub-signature-256'))) return json({error:'Invalid signature'},401);
  const body=JSON.parse(raw); const value=body?.entry?.[0]?.changes?.[0]?.value; const msg=value?.messages?.[0];
  if(!msg) return json({received:true,ignored:true});
  const from=msg.from; let text='';
  try {
    if(msg.type==='text') text=msg.text?.body||'';
    else if(msg.type==='audio'){ const media=await getMedia(msg.audio?.id); text=await transcribeAudio(media,'whatsapp-voice.ogg'); }
    else text=`Received a ${msg.type} message. MANUALE currently handles text and voice notes.`;
    const prompt=`You are MANUALE. This is an inbound WhatsApp message from the A5F owner. Interpret it as an instruction, not as a customer request. Respond in the owner's language with a concise acknowledgement and a short action plan. Do not claim external actions were performed. Owner message: ${text}`;
    const ai=await openaiResponses(prompt); const reply=ai.output_text||'تم استلام الأمر. سأجهزه للتنفيذ.';
    const sent=await sendWhatsApp(from,reply); const auditId=await audit({type:'whatsapp_owner_command',from,messageType:msg.type,transcribedText:text,reply,messageId:sent.messages?.[0]?.id||null});
    return json({received:true,transcribedText:text,reply,auditId});
  } catch(e){ await audit({type:'whatsapp_error',from,messageType:msg.type,error:e.message}); return json({received:true,error:e.message},200); }
};
