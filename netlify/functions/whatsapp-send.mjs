import { json, readJson, env, audit } from '../lib/common.mjs';

export default async (req) => {
  if(req.method!=='POST') return json({error:'POST required'},405);
  const d=await readJson(req); const to=String(d.to||'').replace(/\D/g,''); const text=String(d.text||'').trim();
  if(!to||!text) return json({error:'to and text are required'},400);
  const token=env('META_WHATSAPP_ACCESS_TOKEN'), phoneId=env('META_WHATSAPP_PHONE_NUMBER_ID');
  if(!token||!phoneId) return json({error:'WhatsApp connector is not configured.'},503);
  const r=await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{preview_url:false,body:text}})});
  const j=await r.json(); if(!r.ok) return json({error:j?.error?.message||'WhatsApp send failed',details:j},502);
  const auditId=await audit({type:'whatsapp_outbound',to,text,messageId:j.messages?.[0]?.id||null});
  return json({ok:true,messageId:j.messages?.[0]?.id||null,auditId});
};
