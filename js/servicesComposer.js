var _services_list = [];
var id_counter = 0;
const NAME_SYS_START = '_sys_start_';
const TYPE_SYS_START = '_sys_start_';
const TYPE_REST = 'rest';
const TYPE_SOAP = 'soap';
const TYPE_WIDGET = 'widget';
const TYPE_WORKER = 'worker';

const REST_METHOD_GET = 'get';
const REST_METHOD_POST = 'post';
const REST_METHOD_PUT = 'put';
const REST_METHOD_DELETE = 'delete';

const PHP_GET = 'php/phpGet.php?url='

function Service(name, type) {
    var id = id_counter++, name, type, rest_url, rest_method;
    var nextService = 'undefined';

    this.getNextService = function() {
        return nextService;
    };

    this.setNextService = function(service) {
        nextService = service;
    };

    this.clearNextService = function() {
        nextService = 'undefined';
    };

    this.getId = function() {
        return id;
    };

    this.setName = function(input) {
        name = input;
    };

    this.setType = function(input) {
        type = input;
    };

    this.setRestUrl = function(input) {
        rest_url = input;
    };

    this.setRestMethod = function(input) {
        rest_method = input;
    };

    this.getName = function() {
        return name;
    };

    this.getType = function() {
        return type;
    };

    this.getRestUrl = function() {
        return rest_url;
    };

    this.getRestMethod = function() {
        return rest_method;
    };

    this.getJSON = function() {
        var json = '';
        json += '\"id\":\"' + id + '\", ';
        json += '\"name\":\"' + name + '\", ';
        json += '\"type\":\"' + type + '\", ';
        json += '\"restUrl\":\"' + rest_url + '\", ';
        json += '\"restMethod\":\"' +  rest_method + '\" ';
        return json;
    }

    appendServicesList(this);
}

function appendServicesList(service) {
    _services_list.push(service);
}

function findServiceById(id) {
    var result = 'undefined';
    for(var index = 0; index != _services_list.length; ++index) {
        if(_services_list[index].getId() == id) {
            result = _services_list[index];
            break;
        }
    }
    return result;
}

function updateRestMethodById(id, method) {
    var service = findServiceById(id);
    if(service !== 'undefined') {
        service.setRestMethod(method);
    }
}

function performRestService(uri, resultBuffer, method) {
    var url = uri + resultBuffer;
    var middle = '';
    if(method == REST_METHOD_GET) {
        // use GET middleware
        middle = PHP_GET;
    }
    else if(method == REST_METHOD_POST){
        // use POST middleware
    
    }
    else if(method == REST_METHOD_PUT) {
        // use PUT middleware

    }
    else if(method == REST_METHOD_DELETE) {
        // use DELETE middleware
    }
    return $.ajax({
            url: middle + uri,
            type: method,
            async: false}).responseText;
    // $.ajax({
    //     url: url,
    //     type: method,
    //     async: false,
    //     success: function(result) {
    //         resultBuffer = result.toString();
    //         alert('CHECK: ' + resultBuffer);
    //     }
    // });
}

// TODO: going to be worked out
function createRestCode(service) {
        var req = new XMLHttpRequest();
        var url = service.getRestUrl();
        var method = service.getRestMethod().toUpperCase();
        req.onload = function() {
        }
        req.open(method, url, true);
        req.send(null);
}

