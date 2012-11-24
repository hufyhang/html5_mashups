function fetchLastValueByKey(inputKey, inputJson) {
    var jsonObj = JSON.parse(inputJson);
    var result = jsonObj[inputKey];
    if(result === undefined) {
        result = 'undefined';
    }
    return result;
}

