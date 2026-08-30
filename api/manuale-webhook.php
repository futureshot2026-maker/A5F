<?php
header('Content-Type: application/json; charset=utf-8');
function envv($k){$v=getenv($k);return $v!==false?$v:($_SERVER[$k]??'');}
if($_SERVER['REQUEST_METHOD']==='GET'){
  $mode=$_GET['hub_mode']??'';$token=$_GET['hub_verify_token']??'';$challenge=$_GET['hub_challenge']??'';
  if($mode==='subscribe' && $token!=='' && hash_equals(envv('META_WHATSAPP_VERIFY_TOKEN'),$token)){header('Content-Type: text/plain');echo $challenge;exit;}
  http_response_code(403);echo json_encode(['error'=>'Verification failed']);exit;
}
$body=json_decode(file_get_contents('php://input')?:'{}',true);if(!is_array($body)){$body=[];}
// Production flow: validate Meta signature, extract text/voice message, transcribe voice when needed,
// call /api/manuale-command.php, persist audit event, then send the approved response through Meta Cloud API.
// This endpoint intentionally does not send messages or perform purchases until credentials and server-side permissions are configured.
http_response_code(200);echo json_encode(['received'=>true,'status'=>'queued_for_manuale','next'=>'connect META_WHATSAPP_ACCESS_TOKEN, META_WHATSAPP_PHONE_NUMBER_ID and speech provider'],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
