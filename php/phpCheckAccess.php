<?php
$arg = str_replace(' ', '%20', $_GET['url']);
$arg = str_replace('\\\\', '\\', $arg);
$arg = str_replace('\\\'', '\'', $arg);
$arg = str_replace('\\\"', '\"', $arg);
$index_a = 1;
$index_b = -1;
if(substr($arg, 0, 2) == '\"' && substr($arg, -2) == '\"') {
    $index_a = 2;
    $index_b = -2;
}
$url = substr($arg, $index_a, $index_b);
$curl = curl_init();
curl_setopt_array( $curl, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => $url) );
curl_exec( $curl );
$response_code = curl_getinfo( $curl, CURLINFO_HTTP_CODE );
curl_close( $curl );
echo $response_code;
?>
