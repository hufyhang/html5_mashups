var _services_list = [];
var id_counter = 0;
var NAME_SYS_START = '_sys_start_';
var TYPE_SYS_START = '_sys_start_';
var TYPE_REST = 'rest';
var TYPE_SOAP = 'soap';

var REST_METHOD_GET = 'get';
var REST_METHOD_POST = 'post';
var REST_METHOD_PUT = 'put';
var REST_METHOD_DELETE = 'delete';

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
    return $.ajax({
            url: uri,
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

