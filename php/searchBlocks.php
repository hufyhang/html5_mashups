<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$startKey = strtoupper($_GET['start']);
echo 'Start: ' . $startKey . '<br/>';
$sks = explode(',', $startKey);
$endKey = strtoupper($_GET['end']);
echo 'End: ' . $endKey . '<br/>';
$eks = explode(',', $endKey);

$start = false;
$end = false;

$result = '{"results": [';

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
$mysql_data = mysql_query("SELECT * FROM " . $table);

while($row = mysql_fetch_array($mysql_data)) {
    $start = false;
    $end = false;
    $buffer = '';
    $md5 = $row['md5'];
    $name = $row['name'];
    $json = $row['json'];
    $data = json_decode($json);
    foreach($data->feeds as $feeds) {
        foreach($feeds->feed as $feed) {
            $keys = strtoupper($feed->keywords);
            $keys = explode(',', $keys);
            $isAdded = false;

            foreach($keys as $key) {
                if($isAdded) {
                    break;
                }
                // if hit startKey
                if($start == false && in_array(trim($key), $sks)) {
                    $start = true;
                    $buffer = appendFeed($buffer, $feed);
                    $isAdded = true;
                }
                else if($start == true) {
                    // if hit endKey
                    if($end == false && in_array(trim($key), $eks)) {
                        $end = true;
                        $buffer = appendFeed($buffer, $feed);
                        $isAdded = true;
                    }
                    else {
                        $buffer = appendFeed($buffer, $feed);
                        $isAdded = true;
                    }
                }
            }
            $buffer = rtrim($buffer, ',');
        }
    }
    $buffer = '{"feeds":[' . $buffer . ']}';
    if(strlen($buffer) != 0 && $buffer != '{"feeds":[]}') {
        $buffer = addslashes($buffer);
        $result = $result . '{"md5":"' . $md5 . '", "name":"' . $name . '", "json":"' . $buffer . '"},';
    }
}

// remove the comma at the very last position
$result = rtrim($result, ',');
$result = $result . ']}';

echo $result;
mysql_close($con);

function appendFeed($buffer, $feed) {
    $buffer = $buffer . '{"feed":[{"next":"' . $feed->next . '", "id":"' . $feed->id . '", "name":"' . $feed->name . '", "type":"' . $feed->type . '", "wsdl": "' . $feed->wsdl . '", "soapFuncId":"' . $feed->soapFuncId . '", "restUrl":"' . $feed->restUrl . '", "restMethod":"' . $feed->restMethod . '", "keywords":"' . $feed->keywords . '", "addBefore":"' . $feed->addBefore . '", "addAfter":"' . $feed->addAfter . '", "trimWhiteSpace":"' . $feed->trimWhiteSpace . '", "fetchJSONKey":"' . $feed->fetchJSONKey . '"}]},';
    return $buffer;
}
?>

