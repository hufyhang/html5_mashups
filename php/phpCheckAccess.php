<?php
$url = str_replace(' ','%20',$_GET['url']);
// echo get_http_response_code($url);
// function get_http_response_code($url) {
//     $headers = get_headers($url);
//     return substr($headers[0], 9, 3);
// }
$curl = curl_init();
curl_setopt_array( $curl, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => $url) );
curl_exec( $curl );
$response_code = curl_getinfo( $curl, CURLINFO_HTTP_CODE );
curl_close( $curl );
echo $response_code;
?>
