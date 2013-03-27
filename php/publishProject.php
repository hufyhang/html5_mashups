<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$md5 = $_GET['md5'];
$name = urldecode($_GET['name']);
$author = urldecode($_GET['author']);
$description = urldecode($_GET['description']);
$json = urldecode($_GET['json']);
$keywords = urldecode($_GET['keywords']);

echo 'MD5: ' . $md5 . '<br/>';
echo 'NAME: ' . $name . '<br/>';
echo 'AUTHOR: ' . $author . '<br/>';
echo 'DESC: ' . $description . '<br/>';
echo 'KEY: ' . $keywords . '<br/>';
echo 'JSON: ' . $json . '<br/>';

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
mysql_query("INSERT INTO ".$table." (md5, name, author, description, json, keywords) VALUES ('".$md5."','".$name."','".$author."','".$description."','".$json."','".$keywords."')");

echo '<br/><b>ERROR:</b> ' . mysql_error() . '<br/>';

mysql_close($con);
echo 'done';
?>

