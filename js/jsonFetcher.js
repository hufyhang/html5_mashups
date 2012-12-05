function fetchLastValueByKey(inputKey, inputJson) {
    appendLog('Fetch key: "' + inputKey + '" in JSON: ' + inputJson);
    var jsonObj = JSON.parse(inputJson);
    var result = jsonObj[inputKey];
    if(result === undefined) {
        result = 'undefined';
    }
    appendLog('Fetched value: ' + result);
    return result;
}

