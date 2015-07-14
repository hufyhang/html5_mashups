<?php
$uid = $_GET['uid'];
$lang = 'EN';

if(isset($_GET['lang'])) {
    $lang = strtoupper($_GET['lang']);
}

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
<html version="HTML+RDFa 1.1" lang="en"
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:su="http://feifeihang.info/hypermash/semantic-usdl#">
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
if($lang == 'EN' || $lang == 'EN' || $lang == 'EN-US') {
    echo 'The composite service <span class="composite-name" property="dc:title">' . $name . '</span>
        ';
    echo ' (UID: <span class="composite-uid" property="dc:identifier">' . $md5 . '</span>)
        ';
    echo ' is created by <span class="composite-author" property="dc:creator">' . $author . '</span>.<br/>
        ';
    echo 'According to the author(s), this composite service: <br/><blockquote property="dc:description">' . $description . '</blockquote>
        ';
    echo '<p>This composite service consists of the following primitive services:</p>';
}
else if($lang == 'ZH' || $lang == 'ZH-CN') {
    echo '本聚合服务 <span class="composite-name" property="dc:title">' . $name . '</span>
        ';
    echo ' (UID: <span class="composite-uid" property="dc:identifier">' . $md5 . '</span>)
        ';
    echo ' 由 <span class="composite-author" property="dc:creator">' . $author . '</span> 创建。<br/>
        ';
    echo '根据作者描述, 本聚合服务: <br/><blockquote property="dc:description">' . $description . '</blockquote>
        ';
    echo '<p>本聚合服务包含如下网络服务：</p>';
}

?>

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

        $keys_string = 'keyword(s)';
        if($lang == 'ZH' || $lang == 'CN-ZH') {
            $keys_string = '关键词';
        }

        $buffer = $buffer . "<div resource='#$url' typeof='su:primitive'>";
        $buffer = $buffer . '<span class="primitive-name" property="su:name">' . $feed->name . '</span> ( '. $keys_string .': ';
        $keys = explode(',', $feed->keywords);
        foreach($keys as $k) {
            $buffer = $buffer . '<span class="keywords" property="su:keyword" resource="' . $KEYWORD_PHP . 'key=' . trim($k, ' ') . '">' .trim($k, ' '). '</span> ';
        }

        if($lang == 'EN' || $lang == 'EN' || $lang == 'EN-US') {
            $buffer = $buffer . ') is ';
        }
        else if($lang == 'ZH' || $lang == 'ZH-CN') {
            $buffer = $buffer . ') 是';
        }

        switch($typeFlag) {
        case $REST:
            if($lang == 'EN' || $lang == 'EN' || $lang == 'EN-US') {
                $buffer = $buffer . 'an <span property="su:type" class="type">RESTful</span> service. ';
                $buffer = $buffer . 'Its accessing URL is <span property="su:url" class="url">' . $url . '</span>. ';
                $buffer = $buffer . 'It will be invoked through HTTP verb <span property="su:http-verb" class="verb">' . strtoupper($feed->restMethod) . '</span>.';
            }
            else if($lang == 'ZH' || $lang == 'ZH-CN') {
                $buffer = $buffer . '一个 <span property="su:type" class="type">RESTful</span> 服务. ';
                $buffer = $buffer . '其访问地址为 <span property="su:url" class="url">' . $url . '</span>. ';
                $buffer = $buffer . '在本聚合服务中，其将被通过HTTP verb <span property="su:http-verb" class="verb"> ' . strtoupper($feed->restMethod) . '</span> 进行访问。';
            }
            break;

        case $SOAP:
            if($lang == 'EN' || $lang == 'EN' || $lang == 'EN-US') {
                $buffer = $buffer . 'a <span property="su:type" class="type">SOAP-based</span> service. ';
                $buffer = $buffer . 'Its WSDL refers to <span property="su:wsdl" class="wsdl">' . $url . '</span>. ';
                $client = new SoapClient($url);
                $func = $client->__getFunctions();
                $id = intval($feed->soapFuncId);
                $buffer = $buffer . 'The function <span property="su:soap-function" class="soap-function">' . $func[$id] . '</span> is going to be used.';
            }
            else if($lang == 'ZH' || $lang == 'ZH-CN') {
                $buffer = $buffer . '一个 <span property="su:type" class="type">SOAP-based</span> 服务. ';
                $buffer = $buffer . '其WSDL文档地址为 <span property="su:wsdl" class="wsdl">' . $url . '</span>. ';
                $client = new SoapClient($url);
                $func = $client->__getFunctions();
                $id = intval($feed->soapFuncId);
                $buffer = $buffer . '其SOAP函数/方法 <span property="su:soap-function" class="soap-function">' . $func[$id] . '</span> 将被使用。';

            }
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

<hr/>
<em>This document is automatically generated by Semantic-UiSDL RDFa generator. Semantic-UiSDL RDFa generator is a system component of HyperMash &copy;.</em>
</body>
</html>

