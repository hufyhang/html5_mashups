<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'feeds';

$result = '{"feeds": [';

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
$data = mysql_query("SELECT * FROM " . $table);

while($row = mysql_fetch_array($data)) {
    $md5 = $row['md5'];
    $name = $row['name'];
    $type = $row['type'];
    $restUrl = $row['rest_url'];
    $desc = $row['description'];
    // $desc = str_replace('"', '&quot;' $desc);
    $key = $row['keyword'];

    $result = $result . '{"md5":"' . $md5 . '", "name":"' . $name . '", "type":"' . $type . '", "restUrl":"' . $restUrl . '", "desc":"' . $desc . '", "keyword":"' . $key .'"},';
}

// remove the comma at the very last position
$result = substr($result, 0, strlen($result) - 1);
$result = $result . ']}';

echo $result;
?>

