<?php
ini_set('user_agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:7.0.1) Gecko/20100101 Firefox/7.0.1');
// $USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30';

$arg = str_replace(' ', '%20', $_GET['url']);
$arg = str_replace('\\\\', '\\', $arg);
// $arg = str_replace('\\\'', '\'', $arg);
// $arg = str_replace('\\\"', '\"', $arg);
$index_a = 1;
$index_b = -1;
$arg = substr($arg, $index_a, $index_b);
// if(substr($arg, 0, 2) == '\"' && substr($arg, -2) == '\"') {
//     $index_a = 2;
//     $index_b = -2;
// }
// echo $arg . '<br/>';
// $url = substr($arg, $index_a, $index_b);
// echo $url . '<br/>';
$url = $arg;
$curl = curl_init();

curl_setopt_array( $curl, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_URL => $url) );
curl_setopt($curl, CURLOPT_VERBOSE, true);
curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
$res = curl_exec( $curl );
$response_code = curl_getinfo( $curl, CURLINFO_HTTP_CODE );
// echo curl_error($curl) . '<br/>';
// print "<pre>\n";
// print_r(curl_getinfo($curl));
// echo "\n\ncURL error number:" .curl_errno($curl); // print error info
// echo "\n\ncURL error:" . curl_error($curl); 
// print "</pre>\n";
curl_close( $curl );
echo $response_code;
?>
