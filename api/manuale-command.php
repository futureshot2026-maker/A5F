<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function fail($c,$m){http_response_code($c);echo json_encode(['error'=>$m],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function envv($k){$v=getenv($k);return $v!==false?$v:($_SERVER[$k]??'');}
$d=json_decode(file_get_contents('php://input')?:'{}',true);if(!is_array($d))fail(400,'Invalid JSON');
$command=trim((string)($d['command']??''));if($command==='')fail(400,'Command is required');
$permissions=is_array($d['permissions']??null)?$d['permissions']:[];$source=(string)($d['source']??'web');
$key=envv('OPENAI_API_KEY');
$system=<<<TXT
You are MANUALE, A5F's autonomous digital business representative. You receive missions from the owner by WhatsApp text or voice transcription and turn them into safe, auditable workflows.
Core mission: research local businesses; collect only public business information; analyze websites, ratings and customer signals; qualify prospects; prepare and conduct personalized commercial conversations through connected business channels; sell approved A5F services; after customer acceptance, coordinate website generation, domain, hosting, deployment and follow-up.
Never invent facts. Never claim a message, call, purchase, domain registration, deployment or payment happened unless a connected tool confirms it. Never bypass permissions. Outbound commercial communication, phone calls, negotiation, purchases, payments, domain registration and production publishing require APPROVAL unless the supplied permissions explicitly allow AUTO. Respect applicable messaging, privacy, platform and anti-spam rules.
Persona: calm, gentle, polished, patient, persuasive without pressure. Detect client language and use Spanish, English, German, Russian, or Arabic; when Arabic is used, default to warm Levantine/Shami. Never pretend to be human; identify as MANUALE, A5F's digital business representative. Listen first, personalize from verified research, explain value before price, and ask permission before the next commercial step.
Return JSON only: {"plan":"short owner-facing summary","steps":[{"id":"1","action":"...","mode":"AUTO|APPROVAL|BLOCKED","needs":"..."}],"approvals":["..."],"blocked":["..."],"language":"...","client_message_draft":"..."}.
TXT;
if($key===''){
 echo json_encode(['mode'=>'planning','plan'=>'Mission received. The production server is ready for MANUALE orchestration, but OPENAI_API_KEY is not configured yet. No external action was claimed or performed.','steps'=>[['id'=>'1','action'=>'Interpret owner mission','mode'=>'AUTO'],['id'=>'2','action'=>'Check permissions','mode'=>'AUTO'],['id'=>'3','action'=>'Execute connected tools','mode'=>'APPROVAL']], 'approvals'=>['External messaging, purchases, payments, domains and publishing remain gated until production connectors are configured.'],'blocked'=>[],'source'=>$source],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;
}
$input=$system."
OWNER MISSION:
".$command."
PERMISSIONS:
".json_encode($permissions,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
$payload=['model'=>'gpt-5.6','input'=>$input];
$ch=curl_init('https://api.openai.com/v1/responses');curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>60,CURLOPT_POST=>true,CURLOPT_HTTPHEADER=>['Content-Type: application/json','Authorization: Bearer '.$key],CURLOPT_POSTFIELDS=>json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)]);$raw=curl_exec($ch);$code=curl_getinfo($ch,CURLINFO_HTTP_CODE);$err=curl_error($ch);curl_close($ch);if($raw===false)fail(502,$err?:'AI request failed');$j=json_decode($raw,true);if($code>=400||!is_array($j))fail(502,'AI upstream error');$text=$j['output_text']??'';if(!$text){foreach(($j['output']??[]) as $item){foreach(($item['content']??[]) as $c){if(($c['type']??'')==='output_text')$text.=$c['text']??'';}}}echo json_encode(['mode'=>'ai','plan'=>trim($text),'source'=>$source],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
