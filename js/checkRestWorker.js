const REST_METHOD_GET = 'GET';
const PHP_CHECK_ACCESS = '../php/phpCheckAccess.php?url=';

self.onmessage = function(e) {
    self.postMessage(checkRestService(e.data));
};

function checkRestService(inputUrl) {
    var url = '"' + inputUrl + '"';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(REST_METHOD_GET, PHP_CHECK_ACCESS + url, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}
