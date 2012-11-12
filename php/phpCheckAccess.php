<?php
$url = substr(str_replace(' ','%20',$_GET['url']), 1, -1);
$curl = curl_init();
curl_setopt_array( $curl, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => $url) );
curl_exec( $curl );
$response_code = curl_getinfo( $curl, CURLINFO_HTTP_CODE );
curl_close( $curl );
echo $response_code;
?>
