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

const PHP_CHECK_ACCESS = 'php/phpCheckAccess.php?url=';
const PHP_GET = 'php/phpGet.php?url=';
const PHP_POST = 'php/phpPost.php?url=';
const PHP_PUT = 'php/phpPut.php?url=';
const PHP_DELETE = 'php/phpDelete.php?url=';

var _feeds_nodes = [];
var serviceBuffer = []; // for iterating feeds
var serviceIndex = 0;
var currentServce = undefined;
var serviceCounter;
var geolocation = {json:'', text: ''};
var __result_buffer__ = '';
var __rest_result_buffer__ = '';
var _output = '';

function Service(name, type) {
    var id = id_counter++, name, type, soap_wsdl = '', soap_funcId = 0, rest_url = '', rest_method, keywords = '';
    //extra data members
    var fetchJSONkey = ''; 
    var addTextObject = undefined;
    var trimWhiteSpace = undefined;
    var nextService = 'undefined';

    this.setTrimWhitespace = function(obj) {
        trimWhiteSpace = obj;
    };
    this.getTrimWhitespace = function() {
        return trimWhiteSpace;
    };

    this.setAddTextObject = function(obj) {
        addTextObject = obj;
    };
    this.getAddTextObject = function() {
        return addTextObject;
    };

    this.setFetchJSONKey = function(inputKey) {
        fetchJSONkey = inputKey;
    };
    this.getFetchJSONKey = function() {
        return fetchJSONkey;
    };

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

    this.setWSDL = function(input) {
        soap_wsdl = input;
    };

    this.setSoapFunctionId = function(input) {
        soap_funcId = input;
    };

    this.getSoapFunctionId = function() {
        return soap_funcId;
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

    this.getWSDL = function() {
        return soap_wsdl;
    };

    this.getRestUrl = function() {
        return rest_url;
    };

    this.getRestMethod = function() {
        return rest_method;
    };

    this.getKeywords = function() {
        return keywords;
    };

    this.setKeywords = function(inputKeywords) {
        keywords = inputKeywords;
    };
    

    this.getJSON = function() {
        var json = '';
        var beforeText = '';
        var afterText = '';
        var trimWhiteSpaceWith = ' ';
        if(addTextObject !== undefined && addTextObject != 'undefined') {
            beforeText = addTextObject.getBeforeText();
            afterText = addTextObject.getAfterText();
        }
        if(trimWhiteSpace !== undefined && trimWhiteSpace != 'undefined') {
            trimWhiteSpaceWith = trimWhiteSpace.getReplaceWith();
        }
        json += '\"id\":\"' + id + '\", ';
        json += '\"name\":\"' + name + '\", ';
        json += '\"type\":\"' + type + '\", ';
        json += '\"wsdl\":\"' + soap_wsdl + '\", ';
        json += '\"soapFuncId\":\"' + soap_funcId + '\", ';
        json += '\"restUrl\":\"' + rest_url + '\", ';
        json += '\"restMethod\":\"' +  rest_method + '\", ';
        json += '\"keywords\":\"' + keywords + '\", ';
        json += '\"addBefore\":\"' + beforeText + '\", ';
        json += '\"addAfter\":\"' + afterText + '\", ';
        json += '\"trimWhiteSpace\":\"' + trimWhiteSpaceWith + '\", ';
        json += '\"fetchJSONkey\":\"' + fetchJSONkey + '\" ';
        return json;
    };

    appendServicesList(this);
}

function terminateWebWorkers(checkWorker, serviceWorker, soapWorker) {
    serviceWorker.terminate();
    appendLog('Web Worker "serviceWorker" terminated.');
    checkWorker.terminate();
    appendLog('Web Worker "checkWorker" terminated.');
    soapWorker.terminate();
    appendLog('Web Worker "soapWorker" terminated.');
}

function valueOrDefault(val, def) {
    if(def === undefined) def = '';
    return val == undefined ? def : val;
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

function updateSoapFunctionById(id, funcId) {
    var service = findServiceById(id);
    if(service !== 'undefined') {
        service.setSoapFunctionId(funcId);
    }
}

function startComposition(inputFeedNodes, dataset) {
    _feeds_nodes = inputFeedNodes;
    appendLog('Start generating workflow with dataset "' + dataset + '".');

    // reset function counter
    _big_counter = 0;
    // initiate _big_buffer
    dataset = dataset.replace(/[\\]/g, '\\\\'); // replace \ with \\
    dataset = dataset.replace(/"/g, '&quot;'); // replace " with \"
    dataset = dataset.replace(/\'/g, '\\\''); // replace ' with \'
    dataset = dataset.replace(/&/g, '%26'); // replace ' with \'

    startToIterateFeeds(_feeds_nodes[0]); 

    // execute the mashup
    executeMashup(dataset);
}

function startToIterateFeeds(feed) {
    // visible activity_indicator
    visibleElement('activity_indicator');
    // invisible executionFullScreenToggleButton
    invisibleElement('executionFullScreenToggleButton');

    // reset serviceBuffer & serviceIndex
    serviceBuffer = [];
    serviceIndex = 0;
    _output = '';
    iterateFeeds(feed);
}

function iterateFeeds(feed){
    var service = feed.getService();
    serviceBuffer[serviceIndex] = service;
    serviceIndex++;
    var next = feed.getNextFeed();
    if(next !== 'undefined') {
        iterateFeeds(next);
    }
}

function appendOutput(msg) {
    _output += msg + '<br/>';
    appendLog('Appened "' + msg + '" into output buffer.');
}

function executeMashup(dataset) {
    currentServce = undefined;
    serviceCounter = 1;  // skip the start node
    __result_buffer__ = dataset;
    __rest_result_buffer__ = '';
    if(typeof(Worker) === 'undefined') {
        showMessageDialog('Oops! Surprisingly, your Web browser does not support Web Worker. Working procedure terminated.');
        appendLog('Web browser does not support Web Worker. Working procedure terminated.');
        invisibleElement('activity_indicator');
        return;
    }
    var tempBuffer = '';  // for storing the special chars replaced __result_buffer__
    appendLog('Initialising Web Worker "serviceWorker"...');
    var serviceWorker = new Worker("js/serviceWorker.js");
    appendLog('Web Worker "serviceWorker" initialised.');
    appendLog('Initialising Web Worker "checkRestWorker"...');
    var checkWorker = new Worker("js/checkRestWorker.js");
    appendLog('Web Worker "checkRestWorker" initialised.');
    appendLog('Initialising Web Worker "soapWorker"...');
    var soapWorker = new Worker("js/soapWorker.js");
    appendLog('Web Worker "soapWorker" initialised.');
    currentServce = serviceBuffer[serviceCounter];
    // handle the very first feed
    switch(currentServce.getType()) {
    case TYPE_REST:
        var url = serviceBuffer[serviceCounter].getRestUrl().replace(/&/g, '%26');
        tempBuffer = __result_buffer__.replace(/&/g, '%26');  // replace all & in __result_buffer__ in order to make PHP works correctly
        __rest_result_buffer__ = tempBuffer;
        checkWorker.postMessage(url + tempBuffer);
        break;

    case TYPE_SOAP:
        executeSoap(__result_buffer__, serviceWorker, checkWorker, soapWorker);
        break;

    case TYPE_WORKER:
        __result_buffer__ = executeSysWoker(__result_buffer__);
        var result = executeFromSysWoker(__result_buffer__, serviceWorker, checkWorker, soapWorker);
        if(result === false) {
            terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
            return;
        }
        else {
            __result_buffer__ = result;
        }
        break;

    case TYPE_WIDGET:
        executeWidget(__result_buffer__);
        appendLog('Showing result in execute_output');
        invisibleElement('activity_indicator');
        visibleElement('executionFullScreenToggleButton');
        terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
        return;
        break;

    default:
        break;
    }

    // checkWorker onmessage event
    checkWorker.onmessage = function(e) {
        __result_buffer__ = decodeURIComponent(__rest_result_buffer__);
        var bf = __result_buffer__.replace('"', '\\"');
        bf = bf.replace(/&/g, '%26');  // replace all & in __result_buffer__ in order to make PHP works correctly
        var code = e.data;
        if(code != '200') {
            showServiceErrorDialog('Oops! Service "' + currentServce.getName() + '" is down. Please try later or use an alternative service feed.', serviceCounter, currentServce.getKeywords()); 
            appendLog('"' + currentServce.getName() + '" is down. #' + code);
            invisibleElement('activity_indicator');
            highlightErrorNode(serviceCounter);
            terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
            return;
        }

        if(currentServce.getType() == TYPE_REST) {
            appendLog('Received code: ' + code + ' from ' + currentServce.getRestUrl() + __result_buffer__);
            // if this is the last feed and is a REST service
            if(serviceCounter == serviceBuffer.length - 1) {
                currentServce = serviceBuffer[serviceCounter];
                if(currentServce.getType() == TYPE_REST) {
                    var url = currentServce.getRestUrl() +  __result_buffer__;
                    $("#execute_output").html(_output + '<iframe frameborder="0" width="100%" height="400px" src="' + url + '" seamless="seamless"><p>Surprisingly, your browser does not support iframes.</p></iframe>');
                }
                appendLog('Showing result in execute_output');
                invisibleElement('activity_indicator');
                visibleElement('executionFullScreenToggleButton');
                terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
                return;
            }
            // <END> if this is the last feed and is a REST service </END>
            serviceCounter++;
            var url = currentServce.getRestUrl().replace(/&/g, '%26');
            var json = '{"type":"' + currentServce.getType() + '", "url":"' + url + '", "method":"' + currentServce.getRestMethod() + '", "buffer":"' + bf + '"}';
            serviceWorker.postMessage(json);
        }
    };

    // serviceWorker onmessage event
    serviceWorker.onmessage = function(e) {
        __result_buffer__ = e.data;
        appendLog('Received data: ' + __result_buffer__ );
        currentServce = serviceBuffer[serviceCounter];
        // if the current feed is an RESTful service
        if(currentServce.getType() == TYPE_REST) {
            var url = currentServce.getRestUrl().replace(/&/g, '%26');
            tempBuffer = __result_buffer__.replace(/&/g, '%26'); // replace all & in __result_buffer__ in order to make PHP works correctly
            __rest_result_buffer__ = tempBuffer;
            checkWorker.postMessage(url + tempBuffer);
        }
        //else if it is TYPE_WORKER
        else if(currentServce.getType() == TYPE_WORKER) {
            __result_buffer__ = executeSysWoker(__result_buffer__);
            var result = executeFromSysWoker(__result_buffer__, serviceWorker, checkWorker, soapWorker);
            if(result === false) {
                return;
            }
            else {
                __result_buffer__ = result;
            }
        }
        // else if it is TYPE_WIDGET
        else if(currentServce.getType() == TYPE_WIDGET) {
            executeWidget(__result_buffer__);
            appendLog('Showing result in execute_output');
            invisibleElement('activity_indicator');
            visibleElement('executionFullScreenToggleButton');
            terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
            return;
        }
        // <END>else if it is TYPE_WIDGET</END>
        else if(currentServce.getType() == TYPE_SOAP) {
            executeSoap(__result_buffer__, serviceWorker, checkWorker, soapWorker);
        }
    };
}

function executeSoap(__result_buffer__, checkWorker, serviceWorker, soapWorker) {
    var bf = __result_buffer__.replace('"', '\\"');
    bf = bf.replace(/&/g, '%26');  // replace all & in __result_buffer__ in order to make PHP works correctly
    var wsdl = currentServce.getWSDL();
    var funcId = currentServce.getSoapFunctionId();
    var func = '';
    var par = __result_buffer__;
    var wkr = new Worker("js/wsdlFunctionsWorker.js");
    wkr.postMessage(wsdl);
    wkr.onmessage = function(e) {
        var json = $.parseJSON(e.data);
        func = json[funcId].split(' ')[1].trim().split('(')[0]; //get the function name
        // encode URI Components
        var message = 'wsdl=' + encodeURIComponent(wsdl) + '&code=' + encodeURIComponent(func + '(' + par + ')');
        soapWorker.postMessage(message);
        soapWorker.onmessage = function(e) {
            var data = e.data;
            appendLog('Received data: ' + data + ' from ' + wsdl);
            if(data == 'ERROR') {
                showServiceErrorDialog('Oops! Service "' + currentServce.getName() + '" is down. Please try later or use an alternative service feed.', serviceCounter, currentServce.getKeywords()); 
                appendLog('"' + currentServce.getName() + '" is down. #' + e.data);
                invisibleElement('activity_indicator');
                highlightErrorNode(serviceCounter);
                terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
                return;
            }
            __result_buffer__ = data;
            // if this is the last feed and is a SOAP service
            if(serviceCounter == serviceBuffer.length - 1) {
                currentServce = serviceBuffer[serviceCounter];
                if(currentServce.getType() == TYPE_SOAP) {
                    $('#execute_output').html(_output + '<div style="max-height:300px;max-width:100%;text-align:justify;" class="scrollable_div">' + __result_buffer__ + '</div>');
                }
                appendLog('Showing result in execute_output');
                invisibleElement('activity_indicator');
                visibleElement('executionFullScreenToggleButton');
                terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
                return;
            }
            // <END> if this is the last feed and is a REST service </END>
            serviceCounter++;
            currentServce = serviceBuffer[serviceCounter];
            if(currentServce.getType() == TYPE_REST) {
                var url = serviceBuffer[serviceCounter].getRestUrl().replace(/&/g, '%26');
                tempBuffer = __result_buffer__.replace(/&/g, '%26');  // replace all & in __result_buffer__ in order to make PHP works correctly
                __rest_result_buffer__ = tempBuffer;
                checkWorker.postMessage(url + tempBuffer);
            }
            else if(currentServce.getType() == TYPE_WORKER) {
                __result_buffer__ = executeSysWoker(__result_buffer__);
                var result = executeFromSysWoker(__result_buffer__, serviceWorker, checkWorker, soapWorker);
                if(result === false) {
                    return;
                }
                else {
                    __result_buffer__ = result;
                }
            }
            else if(currentServce.getType() == TYPE_WIDGET) {
                executeWidget(__result_buffer__);
                appendLog('Showing result in execute_output');
                invisibleElement('activity_indicator');
                visibleElement('executionFullScreenToggleButton');
                terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
                return;
            }
        };
        wkr.terminate();
    };
}

function executeSysWoker(__result_buffer__) {
    switch(currentServce.getName()) {
    case WORKER_FETCH_LAST_BY_KEY:
        var key = currentServce.getFetchJSONKey();
        var json = __result_buffer__;
        __result_buffer__ = fetchLastValueByKey(key, json);
        break;
    case WORKER_ADD_TEXT:
        var before = currentServce.getAddTextObject().getBeforeText();
        var after = currentServce.getAddTextObject().getAfterText();
        before = decodeURIComponent(before);
        after = decodeURIComponent(after);
        __result_buffer__ = before + __result_buffer__ + after;
        appendLog('Added text {BEFORE:"' + before + '", AFTER: "' + after + '"} ==> ' + __result_buffer__);
        break;
    case WORKER_TRIM_WHITESPACE:
        var trimWith = currentServce.getTrimWhitespace().getReplaceWith();
        __result_buffer__ = __result_buffer__.replace(/\ /g, trimWith);
        appendLog('Trimmed & replaced whitespace with "' + trimWith + '".');
        break;
    case WORKER_GEO_JSON:
        if(geolocation !== false) {
            __result_buffer__ = geolocation['json'];
            appendLog('Retrieved Geolocation: ' + __result_buffer__);
        }
        else {
            showMessageDialog('Oops! Surprisingly, your Web browser does not support HTML5 Geolocation API. Geolocation worker is skipped in your workflow.');
            appendLog('Web browser does not support HTML5 Geolocation API.');
        }
        break;
    case WORKER_GEO_TEXT:
        if(geolocation !== false) {
            __result_buffer__ = geolocation['text'];
            appendLog('Retrieved Geolocation: ' + __result_buffer__);
        }
        else {
            showMessageDialog('Oops! Surprisingly, your Web browser does not support HTML5 Geolocation API. Geolocation worker is skipped in your workflow.');
            appendLog('Web browser does not support HTML5 Geolocation API.');
        }
        break;
    case WORKER_OUTPUT:
        appendOutput(__result_buffer__);
        break;
    case WORKER_REMOVE_SPECIAL:
        __result_buffer__ = __result_buffer__.replace(/&/g, '');
        __result_buffer__ = __result_buffer__.replace(/\'/g, '');
        __result_buffer__ = __result_buffer__.replace(/\"/g, '');
        __result_buffer__ = __result_buffer__.replace(/,/g, '');
        __result_buffer__ = __result_buffer__.replace(/\./g, '');
        __result_buffer__ = __result_buffer__.replace(/\!/g, '');
        __result_buffer__ = __result_buffer__.replace(/\?/g, '');
        __result_buffer__ = __result_buffer__.replace(/\=/g, '');
        __result_buffer__ = __result_buffer__.replace(/\:/g, '');
        __result_buffer__ = __result_buffer__.replace(/\;/g, '');
        break;
    default:
        break;
    }
    return __result_buffer__;
}

function executeGeolocation() {
    if(navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            geolocation = {json: '', text: ''};
            geolocation['json'] = '{"latitude":"' + position.coords.latitude + '", "longitude":"' + position.coords.longitude + '"}';
            geolocation['text'] = position.coords.latitude + ',' + position.coords.longitude;
        });
    }
    else {
        geolocation = false;
    }
}

function executeWidget(__result_buffer__) {
    if(currentServce.getName() == WIDGET_AUDIO) {
        $("#execute_output").html(_output + '<audio width="100%" controls="controls" autoplay><source src="' + __result_buffer__ + '">Surprisingly, your browser does not support the audio element.</audio>');
    }
    else if (currentServce.getName() == WIDGET_VIDEO) {
        $("#execute_output").html(_output + '<video width="100%" height="400px" controls="controls" autoplay><source src="' + __result_buffer__ + '">Surprisingly, your browser does not support the video tag.</video>');
    }
    else if(currentServce.getName() == WIDGET_IMAGE) {
        $("#execute_output").html(_output + '<img width="100%" height="400px" src="' + __result_buffer__ + '"/>');
    }
}

function executeFromSysWoker(__result_buffer__, serviceWorker, checkWorker, soapWorker) {
    var result = __result_buffer__;
    serviceCounter++;
    currentServce = serviceBuffer[serviceCounter];
    if(currentServce == "undefined" || currentServce == undefined) {
        $('#execute_output').html(_output + '<div style="max-height:300px;max-width:100%;text-align:justify;" class="scrollable_div">' + __result_buffer__ + '</div>');
        appendLog('Showing result in execute_output');
        invisibleElement('activity_indicator');
        // visibleElement('executionFullScreenToggleButton');
        terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
        result = false;
    }
    else if(currentServce.getType() == TYPE_REST) {
        tempBuffer = __result_buffer__.replace(/&/g, '%26'); // replace all & in __result_buffer__ in order to make PHP works correctly
        __rest_result_buffer__ = tempBuffer;
        checkWorker.postMessage(currentServce.getRestUrl().replace(/&/g, '%26') + tempBuffer);
    }
    else if(currentServce.getType() == TYPE_SOAP) {
        executeSoap(__result_buffer__, serviceWorker, checkWorker, soapWorker);
    }
    else if(currentServce.getType() == TYPE_WIDGET) {
        executeWidget(__result_buffer__);
        appendLog('Showing result in execute_output');
        invisibleElement('activity_indicator');
        visibleElement('executionFullScreenToggleButton');
        terminateWebWorkers(checkWorker, serviceWorker, soapWorker);
        result = false;
    }
    else if(currentServce.getType() == TYPE_WORKER) {
            __result_buffer__ = executeSysWoker(__result_buffer__);
            var rst = executeFromSysWoker(__result_buffer__, serviceWorker, checkWorker, soapWorker);
            if(rst === false) {
                result = rst;
            }
    }
    return result;
}

function checkGeolocation() {
    for(var index = 0; index != _feeds_nodes.length; ++index) {
        var service = _feeds_nodes[index].getService();
        //retrive geolocation if geolocation node is existing in workflow
        if(service.getType() == TYPE_WORKER && (service.getName() == WORKER_GEO_JSON || service.getName() == WORKER_GEO_TEXT)) {
            executeGeolocation();
        }
    }
}
