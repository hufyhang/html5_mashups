<?php
$arg = str_replace(' ', '%20', $_GET['url']);
$arg = str_replace('\\\\', '\\', $arg);
// $arg = str_replace('\\\'', '\'', $arg);
// $arg = str_replace('\\\"', '\"', $arg);
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
// curl_setopt ($curl, CURLOPT_CAINFO, dirname(__FILE__)."/cacert.pem");
curl_setopt($curl, CURLOPT_VERBOSE, true);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
// curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2); 
$res = curl_exec( $curl );
$response_code = curl_getinfo( $curl, CURLINFO_HTTP_CODE );
// print "<pre>\n";
// print_r(curl_getinfo($curl));
// echo "\n\ncURL error number:" .curl_errno($curl); // print error info
// echo "\n\ncURL error:" . curl_error($curl); 
// print "</pre>\n";
curl_close( $curl );
echo $response_code;
?>
