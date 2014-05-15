<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$id = $_GET['id'];

$result = '';

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
$data = mysql_query("SELECT * FROM " . $table . " WHERE md5='" . $id . "'");

while($row = mysql_fetch_array($data)) {
    $result = $row['json'];
    // $json = addslashes($json);

}

echo $result;
mysql_close($con);
?>

