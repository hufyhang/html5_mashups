<?php
$wsdl=$_GET["wsdl"];
$client=new SoapClient($wsdl);
echo json_encode($client->__getFunctions());
?>

