<?php
try {
    $wsdl = urldecode($_GET['wsdl']);
    $code = urldecode($_GET['code']);
    $client = new SoapClient($wsdl);
    $code = str_replace('&quot;', '"', $code);
    $func = create_function('$sc', 'echo json_encode($sc->' . $code . ');');
    // $func = create_function('$sc', '$result = $sc->' . $code . ';print_r($result);');
    // $func = create_function('$sc', 'echo json_encode($sc->getMobileCodeInfo(array("mobileCode"=>"13973738080", "userID"=>"")));');
    $func($client);
} catch(SoapFault $fault) {
    echo 'ERROR';
}
?>

