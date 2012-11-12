<?php
$url = substr(str_replace(' ','%20',$_GET['url']), 1, -1);
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
