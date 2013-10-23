<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$startKey = $_POST['url'];

// echo 'URL: ' . $startKey . '      ';

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
    $name = '';
    $json = $row['json'];
    $data = json_decode($json);
    // echo 'Project: ' . $name . '      ';
    foreach($data->feeds as $feeds) {
        foreach($feeds->feed as $feed) {
            if(true == $start && true == $end) {
                break;
            }

            $type = strtoupper($feed->type);
            $url = '';
            if($type == 'REST') {
                $url = $feed->restUrl;
            }
            else if($type == 'SOAP') {
                $url = $feed->wsdl;
            }
            // echo 'Checking: ' . $url . '      ';

            if($start == true && $end == true) {
                break;
            }

            // if hit startKey
            if($start == false && $url == $startKey) {
                $start = true;
            }
            else if($start == true) {
                // if is not a service feed, then just append
                // otherwise, append the feed and stop iteration
                if(strtoupper($feed->type) == 'REST' || strtoupper($feed->type == 'SOAP')) {
                    $end = true;
                    $name = $feed->name;
                    $buffer = appendFeed($buffer, $feed);
                    break;
                }
                else {
                    $buffer = appendFeed($buffer, $feed);
                }
            }
        }
    }
    $buffer = rtrim($buffer, ',');


    $buffer = '{"feeds":[' . $buffer . ']}';
    if(strlen($buffer) != 0 && $buffer != '{"feeds":[]}') {
        $buffer = addslashes($buffer);
        if($name == '') {
            $name = 'From: ' . $row['name'];
        }
        $result = $result . '{"md5":"' . $md5 . '", "name":"' . $name . '", "json":"' . $buffer . '"},';
    }
}

// remove the comma at the very last position
$result = rtrim($result, ',');
$result = $result . ']}';

if($result == '{"results": []}') {
    $result = 'NOTHING-TO-SUGGEST';
}

echo $result;
mysql_close($con);

function appendFeed($buffer, $feed) {
    $buffer = $buffer . '{"feed":[{"next":"' . $feed->next . '", "id":"' . $feed->id . '", "name":"' . $feed->name . '", "type":"' . $feed->type . '", "wsdl": "' . $feed->wsdl . '", "soapFuncId":"' . $feed->soapFuncId . '", "restUrl":"' . $feed->restUrl . '", "restMethod":"' . $feed->restMethod . '", "keywords":"' . $feed->keywords . '", "addBefore":"' . $feed->addBefore . '", "addAfter":"' . $feed->addAfter . '", "trimWhiteSpace":"' . $feed->trimWhiteSpace . '", "fetchJSONkey":"' . $feed->fetchJSONkey . '"}]},';
    return $buffer;
}
?>

