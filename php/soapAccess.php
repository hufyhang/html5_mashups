<?php
$wsdl = urldecode($_GET['wsdl']);
$code = urldecode($_GET['code']);
$client = new SoapClient($wsdl);
$func = create_function('$sc', 'echo json_encode($sc->' . $code . ');');
// $func = create_function('$sc', '$result = $sc->' . $code . ';print_r($result);');
$func($client);
?>

