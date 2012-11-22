const REST_METHOD_GET = 'get';
const REST_METHOD_POST = 'post';
const REST_METHOD_PUT = 'put';
const REST_METHOD_DELETE = 'delete';

const NAME_SYS_START = '_sys_start_';
const TYPE_SYS_START = '_sys_start_';
const TYPE_REST = 'rest';
const TYPE_SOAP = 'soap';
const TYPE_WIDGET = 'widget';
const TYPE_WORKER = 'worker';

const PHP_GET = '../php/phpGet.php?url=';
const PHP_POST = '../php/phpPost.php?url=';
const PHP_PUT = '../php/phpPut.php?url=';
const PHP_DELETE = '../php/phpDelete.php?url=';

self.onmessage = function(e) {
    var json = e.data;
    var jsonObj = (eval('('+ json + ')'));
    var type = jsonObj.type;
    if(type == TYPE_REST) {
        var url = jsonObj.url;
        var method = jsonObj.method;
        var buffer = jsonObj.buffer.replace('\\"', '"');
        self.postMessage(performRestService(url, buffer, method));
    }
};

function performRestService(uri, resultBuffer, method) {
    var url = '"' +  uri + resultBuffer + '"';
    var middle = '';
    if(method == REST_METHOD_GET) {
        // use GET middleware
        middle = PHP_GET;
    }
    else if(method == REST_METHOD_POST){
        // use POST middleware
        middle = PHP_POST;
    }
    else if(method == REST_METHOD_PUT) {
        // use PUT middleware
        middle = PHP_PUT;
    }
    else if(method == REST_METHOD_DELETE) {
        // use DELETE middleware
        middle = PHP_DELETE;
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(REST_METHOD_GET, middle + url, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}
