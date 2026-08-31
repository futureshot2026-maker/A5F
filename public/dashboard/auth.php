<?php
session_start();
require_once __DIR__ . '/config.php';
function a5f_require_login(){
  if (empty($_SESSION['a5f_admin'])) {
    header('Location: /dashboard/login.php');
    exit;
  }
}
