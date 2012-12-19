function fetchLastValueByKey(inputKey, inputJson) {
    appendLog('Fetch key: "' + inputKey + '" in JSON: ' + inputJson);
    var jsonObj = JSON.parse(inputJson);
    var keys = inputKey.split('>');
    var result = jsonObj;
    for(var index = 0; index != keys.length; ++index) {
        var k = $.trim(keys[index]);
        switch(k.charAt(0)) {
        case '#':
            var num = k.substring(1);
            var i = 0;
            if(num == '_' || num == '#') {
                i = result.length - 1;
            }
            else {
                i = parseInt(k.substring(1), 10) - 1;
            }
            result = result[i];
            break;
        default:
            result = fetchCurrentLevel(k, result);
            break;
        }
    }

    if(result === undefined) {
        result = 'undefined';
    }
    appendLog('Fetched value: ' + result);
    return result;
}

function fetchCurrentLevel(inputKey, inputJson) {
    return inputJson[inputKey];
}

