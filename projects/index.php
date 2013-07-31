<?php
$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$output = $_GET['output'];
$uid = $_GET['uid'];

$md5 = '';
$name = '';
$author = '';
$description = '';
$json = '';

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
$data = mysql_query("SELECT * FROM " . $table . " WHERE md5='" . $uid . "'");

$row = mysql_fetch_array($data);
$md5 = $row['md5'];
$name = $row['name'];
$author = $row['author'];
$description = $row['description'];
$json = $row['json'];
mysql_close($con);

echo '<!DOCTYPE HTML>';
echo '<html>';
echo '<head>';
echo '<meta charset="utf-8" />';
// echo '<link rel="shortcut icon" href="../img/favicon.ico" />';
// echo '<link rel="stylesheet" href="../css/master.css" />';
echo '<title>' . $md5 . ' -- ' . $name . '</title>';
echo '<script src="../js/jquery.js"></script>';
echo '<script src="../js/script.js"></script>';
echo '<script src="../js/usdlizer.js"></script>';
echo '<script>';

if(strtoupper($output) === 'USDL' || strtoupper($output) === 'USD') {
    echo 'function load() {';
    echo 'var json = \'' . $json . '\';';
    echo 'var usdlizer = new Usdlizer(json);';
    echo 'return usdlizer.getUsdl();';
    echo '}';
}
else if(strtoupper($output) === 'RAW') {
    echo 'function load() {';
    echo 'var json = \'' . $json . '\';';
    echo 'return json;';
    echo '}';
}

echo '</script>';
echo '</head>';
echo '<body>';
echo '<script>';
echo 'document.write(load());';
echo '</script>';
echo '</body>';
echo '</html>';
?>

