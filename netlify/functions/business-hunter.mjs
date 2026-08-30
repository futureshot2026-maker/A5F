import { json, readJson, env, openaiResponses, cleanJsonText, audit } from '../lib/common.mjs';

const schema = { name: 'business_prospects', schema: { type:'object', additionalProperties:false, properties:{
  summary:{type:'object',additionalProperties:false,properties:{total:{type:'integer'},hot:{type:'integer'},warm:{type:'integer'}},required:['total','hot','warm']},
  prospects:{type:'array',items:{type:'object',additionalProperties:false,properties:{name:{type:'string'},category:{type:'string'},address:{type:'string'},rating:{type:['number','null']},reviewCount:{type:'integer'},score:{type:'integer'},priority:{type:'string'},summary:{type:'string'},reasons:{type:'array',items:{type:'string'}},recommendation:{type:'string'},outreach:{type:'string'}},required:['name','category','address','rating','reviewCount','score','priority','summary','reasons','recommendation','outreach']}}
},required:['summary','prospects'] } };

async function placesSearch(location, category, limit) {
  const key = env('GOOGLE_MAPS_API_KEY');
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY is not configured.');
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', { method:'POST', headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.nationalPhoneNumber,places.primaryType,places.businessStatus'}, body:JSON.stringify({textQuery:`${category} in ${location}`,languageCode:'en',regionCode:'ES',pageSize:limit}) });
  const j = await r.json(); if(!r.ok) throw new Error(j?.error?.message || `Places error ${r.status}`); return j.places || [];
}

export default async (req) => {
  if(req.method!=='POST') return json({error:'POST required'},405);
  const d=await readJson(req); const location=String(d.location||'').trim(); const category=String(d.category||'Restaurants').trim(); const limit=Math.max(1,Math.min(20,Number(d.limit||10)));
  if(!location) return json({error:'Location is required.'},400);
  try {
    const places=await placesSearch(location,category,limit);
    const compact=places.map(p=>({id:p.id,name:p.displayName?.text||'',address:p.formattedAddress||'',rating:p.rating??null,reviewCount:p.userRatingCount||0,website:p.websiteUri||'',maps:p.googleMapsUri||'',phone:p.nationalPhoneNumber||'',type:p.primaryType||category,status:p.businessStatus||''}));
    const prompt=`You are A5F Business Hunter. Rank these public business records as prospects for website/digital services. Never invent facts. Missing website is a strong signal. Use only supplied facts. Write outreach in Spanish, concise and non-deceptive, offering an audit/prototype rather than claiming prior contact. Location: ${location}. Category: ${category}. Records: ${JSON.stringify(compact)}`;
    const ai=await openaiResponses(prompt,{schema,tools:[{type:'web_search'}]});
    const result=JSON.parse(cleanJsonText(ai.output_text||''));
    const auditId=await audit({type:'business_hunt',location,category,limit,records:compact,result});
    return json({...result,location,category,auditId});
  } catch(e){ return json({error:e.message, mode:'configuration_required'},503); }
};
