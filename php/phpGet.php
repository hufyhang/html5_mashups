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
// $url = substr($arg, $index_a, $index_b);
$url = $arg;
echo url_get_contents($url);

function url_get_contents ($url) {
    if (!function_exists('curl_init')){ 
        die('CURL is not installed!');
    }
    $ch = curl_init();
    curl_setopt_array( $ch, array(
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_URL => $url) );
    // curl_setopt ($ch, CURLOPT_CAINFO, dirname(__FILE__)."/cacert.pem");
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    // curl_setopt($ch, CURLOPT_USERAGENT, $USER_AGENT);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    // curl_setopt($ch, CURLOPT_URL, $url);
    // curl_setopt($ch, CURLOPT_USERAGENT, $USER_AGENT);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    // curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    // // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2); 
    // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}
?>
