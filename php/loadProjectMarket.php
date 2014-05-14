<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';


$result = '{"projects": [';

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
$data = mysql_query("SELECT * FROM " . $table);

while($row = mysql_fetch_array($data)) {
    $md5 = $row['md5'];
    $name = $row['name'];
    $author = $row['author'];
    $description = $row['description'];
    $json = $row['json'];
    $snapshot = $row['snapshot'];
    $keywords = $row['keywords'];
    // $description = str_replace('"', '&quot;' $description);
    $description = addslashes($description);
    $json = addslashes($json);

    $result = $result . '{"md5":"' . $md5 . '", "name":"' . $name . '", "author":"' . $author . '", "description":"' . $description . '", "json":"' . $json . '", "keywords":"' . $keywords . '", "snapshot":"' . $snapshot . '"},';
}

// remove the comma at the very last position
$result = substr($result, 0, strlen($result) - 1);
$result = $result . ']}';

echo $result;
mysql_close($con);
?>

