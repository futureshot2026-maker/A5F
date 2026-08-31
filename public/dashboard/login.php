<?php
session_start();
require_once __DIR__ . '/config.php';
if (!empty($_SESSION['a5f_admin'])) { header('Location: /dashboard/'); exit; }
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
  $password=(string)($_POST['password']??'');
  if (hash_equals(A5F_ADMIN_PASSWORD,$password)) {
    $_SESSION['a5f_admin']=true;
    session_regenerate_id(true);
    header('Location: /dashboard/'); exit;
  }
  $error='Contraseña incorrecta.';
}
?><!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A5F — Acceso al Centro de Leads</title><link rel="icon" href="/assets/favicon-32.png"><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/dashboard/dashboard.css"><style>body{min-height:100vh;display:grid;place-items:center}.login{width:min(460px,92vw);padding:32px;border:1px solid rgba(0,0,0,.15);background:#fff}.login h1{margin:0 0 10px}.login p{opacity:.7}.login input{width:100%;box-sizing:border-box;padding:14px;margin:12px 0 18px}.login button{border:0;cursor:pointer}.err{color:#a33;margin-bottom:12px}</style></head><body><main class="login"><div class="eyebrow">A5F / OPERACIONES DE LEADS</div><h1>Centro de Leads</h1><p>Acceso exclusivo interno.</p><?php if($error): ?><div class="err"><?=htmlspecialchars($error,ENT_QUOTES,'UTF-8')?></div><?php endif; ?><form method="post"><label>Contraseña</label><input type="password" name="password" autocomplete="current-password" required><button class="btn" type="submit">Entrar →</button></form></main></body></html>
