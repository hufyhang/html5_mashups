<?php
$uid = $_GET['uid'];

header('Content-type: text/html');

$REST = 0;
$SOAP = 1;
$PROJECTS_PHP = 'http://feifeihang.info/hypermash/projects/index.php?';
$KEYWORD_PHP = 'http://feifeihang.info/hypermash/projects/keyword.php?';

$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$md5 = '';
$name = '';
$author = '';
$description = '';
$json = '';

$buffer = '';

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
?>
<!DOCTYPE html>
<html prefix="
    rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#
    dc: http://purl.org/dc/elements/1.1/
    su :http://feifeihang.info/hypermash/semantic-usdl#">
<head>
<?php
echo "<title>$name</title>";
?>
<link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
<?php

echo '<div typeof="su:composite" resource="' . $PROJECTS_PHP . 'uid=' .  $uid . '&amp;output=usdl'. '">
    ';
echo 'The composite service <span class="composite-name" property="dc:title">' . $name . '</span>
    ';
echo ' (UID: <span class="composite-uid" property="dc:identifier">' . $md5 . '</span>)
    ';
echo ' is created by <span class="composite-author" property="dc:creator">' . $author . '</span>.<br/>
    ';
echo 'According to the author(s), this composite service: <br/><blockquote property="dc:description">' . $description . '</blockquote><br/>
    ';
?>

<p>This composite service consists of the following primitive services:</p>
<ol>
<?php
$json = json_decode($json);
$contains = array();
foreach($json->feeds as $feeds) {
    foreach($feeds->feed as $feed) {
        // skip Workers and Widgets
        if(strtoupper($feed->type) == 'WORKER' || strtoupper($feed->type) == 'WIDGET') {
            continue;
        }

        $url = '';
        $typeFlag = -1;
        if(strtoupper($feed->type) == 'REST') {
            $url = $feed->restUrl;
            $typeFlag = $REST;
        }
        else if(strtoupper($feed->type) == 'SOAP') {
            $url = $feed->wsdl;
            $typeFlag = $SOAP;
        }
        $url = str_replace('&', '&amp;', $url);
        array_push($contains, $url);
        echo "<li property='su:contains' href='#$url'>$feed->name</li>";

        $buffer = $buffer . "<div resource='#$url' typeof='primitive-service'>";
        $buffer = $buffer . '<span class="primitive-name" property="su:name">' . $feed->name . '</span> (keyword(s): 
            ';
        $keys = explode(',', $feed->keywords);
        foreach($keys as $k) {
            $buffer = $buffer . '<span class="keywords" property="su:keyword" resource="' . $KEYWORD_PHP . 'key=' . trim($k, ' ') . '">' .trim($k, ' '). '</span> ';
        }

        $buffer = $buffer . ') is ';
        switch($typeFlag) {
        case $REST:
            $buffer = $buffer . 'an <span property="su:type" class="type">RESTful</span> service. ';
            $buffer = $buffer . 'Its accessing URL is <span property="su:url" class="url">' . $url . '</span>. ';
            $buffer = $buffer . 'It will be invoked through HTTP verb <span property="su:http-verb" class="verb">' . strtoupper($feed->restMethod) . '</span>.';
            break;

        case $SOAP:
            $buffer = $buffer . 'a <span property="su:type" class="type">SOAP-based</span> service. ';
            $buffer = $buffer . 'Its WSDL refers to <span property="su:wsdl" class="wsdl">' . $url . '</span>. ';
            $client = new SoapClient($url);
            $func = $client->__getFunctions();
            $id = intval($feed->soapFuncId);
            $buffer = $buffer . 'The function <span property="su:soap-function" class="soap-function">' . $func[$id] . '</span> is going to be used.';
            break;
        }

        $buffer = $buffer . '</div><br/>';
    }
}
?>

</ol>
</div>

<?php
echo $buffer;
?>

</body>
</html>

