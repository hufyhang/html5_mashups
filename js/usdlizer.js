function Usdlizer(_json) {
    this.json = _json;
    this.usdl = '';
}

Usdlizer.prototype.getRaw = function() {
    return this.json;
}

Usdlizer.prototype.getUsdl = function() {
    var buffer = '{"composition":[\n';
    var jsonObj = (eval('(' + this.json + ')'));
    var key, feedsCount = 0;
    for(key in jsonObj.feeds) {
        feedsCount++;
    }
    for(var index = 0; index != feedsCount; ++index) {
        var feed = jsonObj.feeds[index].feed[0];
        var name = feed.name;
        var keywords = feed.keywords;
        var type = feed.type;
        buffer += '{"@name":"' + name + '",\n"@keywords":"' 
                + keywords + '",\n"@type":"' + type + '",\n';

        if(type.toUpperCase() === 'REST') {
            var url = feed.restUrl;
            var verb = feed.restMethod;
            buffer += '"@rest":[{\n' + '"@url":"' + url + '",\n"@verb":"' + verb + '"}]';
        }
        else if(type.toUpperCase() == 'SOAP') {
            var wsdl = feed.wsdl;
            var operation = feed.soapFuncId;
            buffer += '"@soap":[{\n' + '"@wsdl":"' + wsdl + '",\n"@operation":"' + operation + '"}]';
        }
        else if(type.toUpperCase() == 'WIDGET') {
            buffer += '"@widget":[{\n' + '"@widget":"' + name + '"}]';
        }
        else if(type.toUpperCase() == 'WORKER') {
            var addBefore = feed.addBefore;
            var addAfter = feed.addAfter;
            var trimWhiteSpace = feed.trimWhiteSpace;
            var fetchJSONkey = feed.fetchJSONkey;
            buffer += '"@worker":[{\n' + '"@before":"' + addBefore + '",\n"@after":"' + addAfter 
                    + '",\n"@space":"' + trimWhiteSpace + '",\n"@jsonKey":"' + fetchJSONkey + '"}]';
        }
        buffer += '}';
        if(index != feedsCount - 1) {
            buffer += ',\n';
        }
    }

    // wrap up
    buffer += ']}';

    return buffer;
};
