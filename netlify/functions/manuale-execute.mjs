import { json, readJson, env, openaiResponses, cleanJsonText, audit, DEFAULT_PERMISSIONS } from '../lib/common.mjs';

const planSchema = {
  name:'manuale_execution', schema:{type:'object',additionalProperties:false,properties:{
    objective:{type:'string'}, language:{type:'string'}, location:{type:'string'}, category:{type:'string'}, limit:{type:'integer'},
    steps:{type:'array',items:{type:'object',additionalProperties:false,properties:{id:{type:'string'},action:{type:'string'},mode:{type:'string',enum:['AUTO','APPROVAL','BLOCKED']}},required:['id','action','mode']}},
    prospect_query:{type:'string'}, client_message_draft:{type:'string'}, next_action:{type:'string'}
  },required:['objective','language','location','category','limit','steps','prospect_query','client_message_draft','next_action']}
};

const resultSchema = {
  name:'manuale_research_result', schema:{type:'object',additionalProperties:false,properties:{
    summary:{type:'string'}, prospects:{type:'array',items:{type:'object',additionalProperties:false,properties:{name:{type:'string'},category:{type:'string'},location:{type:'string'},website:{type:'string'},phone:{type:'string'},rating:{type:['number','null']},reviews:{type:['integer','null']},why:{type:'string'},outreach:{type:'string'}},required:['name','category','location','website','phone','rating','reviews','why','outreach']}},
    client_message_draft:{type:'string'}, approvals:{type:'array',items:{type:'string'}}, blocked:{type:'array',items:{type:'string'}}, next_action:{type:'string'}
  },required:['summary','prospects','client_message_draft','approvals','blocked','next_action']}
};

function permissionsFor(d){ return {...DEFAULT_PERMISSIONS,...(d.permissions||{})}; }

export default async (req)=>{
  if(req.method!=='POST') return json({error:'POST required'},405);
  const d=await readJson(req); const command=String(d.command||'').trim(); if(!command) return json({error:'Command is required.'},400);
  const permissions=permissionsFor(d);
  try{
    const plannerPrompt=`You are MANUALE, A5F's autonomous digital business operator. Turn the owner's natural-language command into an executable research mission. Detect language. If the owner asks to find businesses/restaurants/shops/services, infer the location and category and a sensible limit (1-20). Never invent a location if none is supplied: use an empty location and request clarification. External outreach, calls, purchases, payments, domains and production publishing are APPROVAL unless permissions say AUTO. Return only the requested JSON.\nOWNER COMMAND:\n${command}\nPERMISSIONS:\n${JSON.stringify(permissions)}`;
    const planned=JSON.parse(cleanJsonText((await openaiResponses(plannerPrompt,{schema:planSchema})).output_text||''));
    let execution={summary:'Mission planned.',prospects:[],client_message_draft:planned.client_message_draft||'',approvals:[],blocked:[],next_action:planned.next_action||'Review the plan.'};

    const wantsResearch = planned.prospect_query && planned.location && permissions.research !== 'BLOCKED';
    if(wantsResearch){
      const researchPrompt=`You are the research engine for MANUALE. Search the public web for ${planned.category} businesses in ${planned.location}. Find up to ${Math.min(20,Math.max(1,planned.limit))} credible prospects suitable for A5F website/digital services. Prefer official websites and reputable public listings. Do not invent facts. Include only facts you can support from the search results. Identify missing/weak websites as opportunities. Prepare a short personalized Spanish outreach draft for each prospect unless the prospect's public site clearly indicates another language. Also provide a general owner-facing summary. Query: ${planned.prospect_query}`;
      const researched=JSON.parse(cleanJsonText((await openaiResponses(researchPrompt,{schema:resultSchema,tools:[{type:'web_search'}]})).output_text||''));
      execution=researched;
      if(permissions.outreach==='APPROVAL') execution.approvals.push('Outbound messages require owner approval before sending.');
      if(permissions.phone==='APPROVAL') execution.approvals.push('Phone calls require owner approval before dialing.');
      if(permissions.domain==='APPROVAL') execution.approvals.push('Domain registration requires owner approval.');
      if(permissions.payment==='APPROVAL') execution.approvals.push('Payments require owner approval.');
      if(permissions.publish==='APPROVAL') execution.approvals.push('Production publishing requires owner approval.');
    } else if(!planned.location && planned.prospect_query){
      execution.blocked.push('Location is missing. Specify a city/area or say "around me" from an approved location source.');
      execution.next_action='Ask the owner for the target location.';
    }
    const auditId=await audit({type:'mission_executed',source:d.source||'web',command,planned,execution,permissions});
    return json({mode:'executed',planned,execution,auditId});
  }catch(e){
    const auditId=await audit({type:'mission_execution_error',source:d.source||'web',command,error:e.message,permissions});
    return json({mode:'error',error:e.message,auditId},503);
  }
};
