<?php
$uid = $_GET['uid'];

header('Content-type: application/rdf+xml');
header('Content-Disposition: attachment; filename="' . $uid . '.rdf"');

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
<rdf:RDF
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:su="http://feifeihang.info/hypermash/semantic-usdl#">
<?php
echo '<rdf:Description rdf:about="' . $PROJECTS_PHP . 'uid=' .  $uid . '&amp;output=usdl'. '">
    ';
echo '<dc:title>' . $name . '</dc:title>
    ';
echo '<dc:creator>' . $author . '</dc:creator>
    ';
echo '<dc:description>' . urlencode($description) . '</dc:description>
    ';
echo '<dc:identifier>' . $md5 . '</dc:identifier>
    ';
echo '</rdf:Description>
    ';
?>

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
        echo '<rdf:Description rdf:about="' . $url . '">
            ';
        echo '<su:name>' . $feed->name . '</su:name>
            ';
        $keys = explode(',', $feed->keywords);
        foreach($keys as $k) {
            echo '<su:keyword rdf:resource="' . $KEYWORD_PHP . 'key=' . trim($k, ' ') . '"/>
                ';
        }

        echo '<su:type>' . $feed->type . '</su:type>
            ';
        switch($typeFlag) {
        case $REST:
            echo '<su:url rdf:resource="' . $url . '"/>
                ';
            echo '<su:http-verb>' . $feed->restMethod . '</su:http-verb>
                ';
            break;

        case $SOAP:
            echo '<su:wsdl rdf:resource="' . $url . '"/>
                ';
            $client = new SoapClient($url);
            $func = $client->__getFunctions();
            $id = intval($feed->soapFuncId);
            echo '<su:soap-function>' . $func[$id] . '</su:soap-function>
                ';
            break;
        }
        echo '</rdf:Description>

            ';
    }
}

echo '<rdf:Description rdf:about="' . $PROJECTS_PHP . 'uid=' .  $uid . '&amp;output=usdl'. '">
    ';
foreach($contains as $contain) {
    echo '<su:contains rdf:resource="' . $contain . '"/>
        ';
}
echo '</rdf:Description>
    ';
?>
</rdf:RDF>

