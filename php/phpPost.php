<?php
$arg = str_replace(' ', '%20', $_GET['url']);
$index_a = 1;
$index_b = -1;
if(substr($arg, 0, 2) == '\"' && substr($arg, -2) == '\"') {
    $index_a = 2;
    $index_b = -2;
}
$url = substr($arg, $index_a, $index_b);
echo url_post_contents($url);

function url_post_contents ($url) {
    if (!function_exists('curl_init')){ 
        die('CURL is not installed!');
    }
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}
?>