<?php
$inputKey = $_GET['key'];

header('Content-type: application/rdf+xml');
header('Content-Disposition: attachment; filename="' . $inputKey . '.rdf"');

$REST = 0;
$SOAP = 1;
$PROJECTS_PHP = 'http://feifeihang.info/hypermash/projects/index.php?';
$RDF_PHP = 'http://feifeihang.info/hypermash/projects/rdf.php?';
$KEYWORD_PHP = 'http://feifeihang.info/hypermash/projects/keyword.php?';

$host = '31.22.4.32';
$usrname = 'feifeiha_public';
$password = 'p0OnMM722iqZ';
$db = 'feifeiha_hypermash_market';
$table = 'projects';

$md5s = array();
$names = array();
$jsons = array();

$con = mysql_connect($host, $usrname, $password);
if(!$con) {
    die('Could not connect: ' . mysql_error());
}
mysql_select_db($db, $con);
$data = mysql_query("SELECT * FROM " . $table);

while($row = mysql_fetch_array($data)) {
    array_push($md5s, $row['md5']);
    array_push($names, $row['name']);
    array_push($jsons, $row['json']);
}
mysql_close($con);
?>
<rdf:RDF
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:su="http://feifeihang.info/hypermash/semantic-usdl#">
<?php
echo '<rdf:Description rdf:about="' . $KEYWORD_PHP . 'key=' .  $inputKey . '">
    ';
echo '<dc:subject>' . $inputKey . '</dc:subject>
    ';
?>
</rdf:Description>


<?php
for($index = 0; $index != count($jsons); ++$index) {
    $found = false;
    $json = json_decode($jsons[$index]);
    foreach($json->feeds as $feeds) {
        foreach($feeds->feed as $feed) {
            // skip Workers and Widgets
            if(strtoupper($feed->type) == 'WORKER' || 
                strtoupper($feed->type) == 'WIDGET') {
            continue;
        }

            $inputKey = strtoupper($inputKey);
            $keys = explode(',', strtoupper($feed->keywords));
            $keys = array_map('trim', $keys);
            if(in_array($inputKey, $keys)) {
                $found = true;
                break;
            }
        }
    }

    if($found == true) {
        echo '<rdf:Description rdf:about="' . $RDF_PHP . 'uid=' . $md5s[$index] . '">
            ';
        echo '<dc:title>' . $names[$index] . '</dc:title>
            ';
        echo '<dc:identifier>' . $md5s[$index] . '</dc:identifier>
            ';
        echo '<su:semantic-usdl rdf:resource="' . $RDF_PHP . 'uid=' . $md5s[$index] . '"/>
            ';
        echo '</rdf:Description>

            ';
    }
}
?>

</rdf:RDF>

