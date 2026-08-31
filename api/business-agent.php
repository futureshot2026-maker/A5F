<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail($code,$msg){http_response_code($code);echo json_encode(['error'=>$msg],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function body(){ $raw=file_get_contents('php://input'); $d=json_decode($raw?:'{}',true); return is_array($d)?$d:[]; }
function envv($key){ $v=getenv($key); if($v!==false && $v!=='') return $v; return $_SERVER[$key]??''; }
function http_json($url,$headers=[],$payload=null,$method='GET'){
  $ch=curl_init($url); curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>45,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>$headers]);
  if($payload!==null){curl_setopt($ch,CURLOPT_POSTFIELDS,is_string($payload)?$payload:json_encode($payload,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));}
  $raw=curl_exec($ch); $code=curl_getinfo($ch,CURLINFO_HTTP_CODE); $err=curl_error($ch); curl_close($ch);
  if($raw===false) fail(502,'Network error: '.$err); $j=json_decode($raw,true); if(!is_array($j)) fail(502,'Invalid upstream response'); if($code>=400) fail($code,'Upstream API error'); return $j;
}
$d=body(); $location=trim((string)($d['location']??'')); $category=trim((string)($d['category']??'Restaurants')); $limit=max(1,min(20,(int)($d['limit']??10)));
if($location==='') fail(400,'Location is required');
$google=envv('GOOGLE_MAPS_API_KEY'); $openai=envv('OPENAI_API_KEY');
if($google==='') fail(503,'GOOGLE_MAPS_API_KEY is not configured on the server.');
if($openai==='') fail(503,'OPENAI_API_KEY is not configured on the server.');

$query=$category.' in '.$location.', Spain';
$search=http_json('https://places.googleapis.com/v1/places:searchText',["Content-Type: application/json","X-Goog-Api-Key: $google","X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.nationalPhoneNumber,places.primaryType,places.businessStatus,places.currentOpeningHours"],['textQuery'=>$query,'languageCode'=>'en','regionCode'=>'ES','pageSize'=>$limit],'POST');
$places=$search['places']??[];
$research=[];
foreach($places as $p){
  $id=$p['id']??''; if(!$id) continue;
  $details=http_json('https://places.googleapis.com/v1/places/'.rawurlencode($id),["X-Goog-Api-Key: $google","X-Goog-FieldMask: id,displayName,formattedAddress,rating,userRatingCount,websiteUri,googleMapsUri,nationalPhoneNumber,primaryType,businessStatus,reviews,reviewSummary,priceLevel,priceRange,reservable,takeout,delivery,dineIn"],null,'GET');
  $research[]=$details;
}
$compact=[];
foreach($research as $p){
  $reviews=[]; foreach(($p['reviews']??[]) as $r){$reviews[]=['rating'=>$r['rating']??null,'text'=>$r['text']['text']??($r['originalText']['text']??''),'publishTime'=>$r['publishTime']??''];}
  $compact[]=['id'=>$p['id']??'','name'=>$p['displayName']['text']??'','address'=>$p['formattedAddress']??'','rating'=>$p['rating']??null,'reviewCount'=>$p['userRatingCount']??0,'website'=>$p['websiteUri']??'','maps'=>$p['googleMapsUri']??'','phone'=>$p['nationalPhoneNumber']??'','type'=>$p['primaryType']??$category,'status'=>$p['businessStatus']??'','reviews'=>$reviews,'reviewSummary'=>$p['reviewSummary']['text']['text']??'','reservable'=>$p['reservable']??false,'takeout'=>$p['takeout']??false,'delivery'=>$p['delivery']??false];
}
$instructions=<<<TXT
You are A5F Business Hunter AI. Analyze the supplied public business research and rank prospects for website/digital transformation services.
Return ONLY valid JSON with this shape: {"summary":{"total":number,"hot":number,"warm":number},"prospects":[{"name":string,"category":string,"address":string,"rating":number|null,"reviewCount":number,"score":number,"priority":"VERY HOT"|"HOT"|"WARM"|"LOW","summary":string,"reasons":string[],"recommendation":string,"outreach":string}]}
Rules: never invent facts. Treat missing website as a strong signal. Use review patterns only from supplied review text/summary. Score 0-100 using website presence, likely digital gaps, review volume, rating, booking/order signals, and business attractiveness. A high rating is not a problem by itself; it can indicate a valuable established business. Keep outreach concise, in Spanish, personalized, non-deceptive, and framed as an offer to show an audit/prototype. Do not claim that A5F already contacted or audited the business beyond the supplied data. Do not include private or sensitive data. Do not recommend spam or bulk unsolicited messaging.
TXT;
$input=$instructions."\nMarket: ".$location."\nCategory: ".$category."\nBusinesses:\n".json_encode($compact,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
$resp=http_json('https://api.openai.com/v1/responses',["Content-Type: application/json","Authorization: Bearer $openai"],['model'=>'gpt-5.6','input'=>$input,'tools'=>[['type'=>'web_search']]],'POST');
$text=$resp['output_text']??'';
if(!$text){ foreach(($resp['output']??[]) as $item){foreach(($item['content']??[]) as $c){if(($c['type']??'')==='output_text'){$text.=$c['text']??'';}}}}
$text=trim($text); if(str_starts_with($text,'```')){$text=preg_replace('/^```(?:json)?\s*/','',$text);$text=preg_replace('/\s*```$/','',$text);}
$result=json_decode($text,true); if(!is_array($result)||!isset($result['prospects'])) fail(502,'AI returned an invalid result.');
$result['location']=$location; $result['category']=$category; echo json_encode($result,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
