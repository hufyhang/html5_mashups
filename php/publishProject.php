<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$md5 = $_POST['md5'];
$name = urldecode($_POST['name']);
$author = urldecode($_POST['author']);
$description = urldecode($_POST['description']);
$json = urldecode($_POST['json']);
$keywords = urldecode($_POST['keywords']);
$snapshot = $_POST['snapshot'];

echo 'MD5: ' . $md5 . '<br/>';
echo 'NAME: ' . $name . '<br/>';
echo 'AUTHOR: ' . $author . '<br/>';
echo 'DESC: ' . $description . '<br/>';
echo 'KEY: ' . $keywords . '<br/>';
echo 'JSON: ' . $json . '<br/>';
echo 'SNAPSHOT (DATA URI): ' . $snapshot . '<br/>';

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
mysql_query("INSERT INTO ".$table." (md5, name, author, description, json, keywords, snapshot) VALUES ('".$md5."','".$name."','".$author."','".$description."','".$json."','".$keywords."','".$snapshot."')");

echo '<br/><b>ERROR:</b> ' . mysql_error() . '<br/>';

mysql_close($con);
echo 'done';
?>

