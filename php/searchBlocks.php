<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$startKey = strtoupper($_GET['start']);
$startKey = preg_replace('/\s+/', '', $startKey);
$sks = explode(',', $startKey);
$endKey = strtoupper($_GET['end']);
$endKey = preg_replace('/\s+/', '', $endKey);
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
        // $keepAdding = false;
        foreach($feeds->feed as $feed) {
            if(true == $start && true == $end) {
                break;
            }

            $keys = strtoupper($feed->keywords);
            $keys = preg_replace('/\s+/', '', $keys);
            $keys = explode(',', $keys);

            if($start == true && $end == true) {
                break;
            }

            // if hit startKey
            if($start == false && count(array_intersect($keys, $sks)) == count($sks)) {
                $start = true;
                $buffer = appendFeed($buffer, $feed);
            }
            else if($start == true) {
                // if hit endKey
                if(count(array_intersect($keys, $eks)) == count($eks)) {
                    $end = true;
                    $buffer = appendFeed($buffer, $feed);
                    break;
                }
                else {
                    $buffer = appendFeed($buffer, $feed);
                }
            }
        }
        $buffer = rtrim($buffer, ',');
    }
    // if endKey not hit, then clean up buffer.
    if(count($eks) != 0 && $end == false) {
        $buffer = '';
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
    $buffer = $buffer . '{"feed":[{"next":"' . $feed->next . '", "id":"' . $feed->id . '", "name":"' . $feed->name . '", "type":"' . $feed->type . '", "wsdl": "' . $feed->wsdl . '", "soapFuncId":"' . $feed->soapFuncId . '", "restUrl":"' . $feed->restUrl . '", "restMethod":"' . $feed->restMethod . '", "keywords":"' . $feed->keywords . '", "addBefore":"' . $feed->addBefore . '", "addAfter":"' . $feed->addAfter . '", "trimWhiteSpace":"' . $feed->trimWhiteSpace . '", "fetchJSONKey":"' . $feed->fetchJSONkey . '"}]},';
    return $buffer;
}
?>

