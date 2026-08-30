<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
const FORMS_FILE=__DIR__.'/../data/forms.json';
const LEADS_FILE=__DIR__.'/../data/leads.json';
function out($c,$b){http_response_code($c);echo json_encode($b,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function input(){ $raw=file_get_contents('php://input'); $ct=$_SERVER['CONTENT_TYPE']??''; if(stripos($ct,'application/json')!==false){$d=json_decode($raw?:'{}',true);return is_array($d)?$d:[];} return $_POST; }
function readj($f){$d=json_decode(@file_get_contents($f)?:'[]',true);return is_array($d)?$d:[];}
function writej($f,$d){$tmp=$f.'.tmp';if(file_put_contents($tmp,json_encode(array_values($d),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT),LOCK_EX)===false)out(500,['error'=>'Storage write failed']);rename($tmp,$f);}
function rid(){return bin2hex(random_bytes(8));}
if(($_SERVER['REQUEST_METHOD']??'GET')!=='POST')out(405,['error'=>'Method not allowed']);
$d=input();
if(trim((string)($d['email']??''))==='') out(400,['error'=>'Email is required']);
$record=$d; $record['_id']=rid(); $record['_createdAt']=date('c'); $record['_ip']=substr($_SERVER['REMOTE_ADDR']??'',0,64);
$forms=readj(FORMS_FILE);array_unshift($forms,$record);writej(FORMS_FILE,$forms);
// Also create a lightweight Lead Center record for public forms.
$leads=readj(LEADS_FILE);
$lead=[
 'id'=>rid(),'createdAt'=>$record['_createdAt'],'name'=>(string)($d['name']??''),'email'=>(string)($d['email']??''),'company'=>(string)($d['company']??''),'role'=>(string)($d['role']??''),'project'=>(string)($d['project']??($d['message']??'')),'status'=>'NEW','value'=>'','notes'=>(string)($d['message']??($d['project']??$d['intro']??'')),'priority'=>'MEDIUM','blueprint'=>null,'blueprintKey'=>'','activities'=>[['at'=>$record['_createdAt'],'text'=>'Public form submission: '.(string)($d['form']??$d['form-name']??'website')]],
];
$leads[]=$lead;writej(LEADS_FILE,$leads);
out(201,['ok'=>true,'lead'=>$lead]);
