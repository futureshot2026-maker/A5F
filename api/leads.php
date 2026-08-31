<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const LEADS_FILE = __DIR__ . '/../data/leads.json';
function out($code,$body){ http_response_code($code); echo json_encode($body,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); exit; }
function body(){ $raw=file_get_contents('php://input'); $data=json_decode($raw?:'{}',true); return is_array($data)?$data:[]; }
function read_leads(){ $raw=@file_get_contents(LEADS_FILE); $data=json_decode($raw?:'[]',true); return is_array($data)?$data:[]; }
function write_leads($data){ $tmp=LEADS_FILE.'.tmp'; if(file_put_contents($tmp,json_encode(array_values($data),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT),LOCK_EX)===false) out(500,['error'=>'Could not write lead storage']); if(!@rename($tmp,LEADS_FILE)) out(500,['error'=>'Could not commit lead storage']); }
function id(){ return bin2hex(random_bytes(8)); }
function normalize($lead,$existing=null){
  $now=date('c');
  return [
    'id'=>(string)($existing['id']??($lead['id']??id())),
    'createdAt'=>(string)($existing['createdAt']??($lead['createdAt']??$now)),
    'name'=>(string)($lead['name']??''),'email'=>(string)($lead['email']??''),'company'=>(string)($lead['company']??''),'role'=>(string)($lead['role']??''),'project'=>(string)($lead['project']??''),'status'=>(string)($lead['status']??'NEW'),'value'=>$lead['value']??'','notes'=>(string)($lead['notes']??''),'priority'=>(string)($lead['priority']??'MEDIUM'),'blueprint'=>$lead['blueprint']??null,'blueprintKey'=>(string)($lead['blueprintKey']??''),'activities'=>is_array($lead['activities']??null)?$lead['activities']:[]
  ];
}
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='OPTIONS') out(204,[]);
if($method==='GET' || $method==='PATCH') { if(empty($_SESSION['a5f_admin'])) out(401,['error'=>'Authentication required']); }
if($method==='GET') out(200,read_leads());
if($method==='POST') {
  $lead=body();
  if(trim((string)($lead['name']??''))==='' && trim((string)($lead['email']??''))==='') out(400,['error'=>'Name or email is required']);
  $all=read_leads(); $row=normalize($lead); array_unshift($all,$row); write_leads($all); out(201,$row);
}
if($method==='PATCH') {
  $b=body(); $target=(string)($b['id']??''); if($target==='') out(400,['error'=>'Missing lead id']);
  $all=read_leads(); $found=false; $updated=null;
  foreach($all as $i=>$row){ if((string)($row['id']??'')===$target){ $updated=normalize(is_array($b['lead']??null)?$b['lead']:[], $row); $all[$i]=$updated; $found=true; break; } }
  if(!$found) out(404,['error'=>'Lead not found']); write_leads($all); out(200,$updated);
}
out(405,['error'=>'Method not allowed']);
