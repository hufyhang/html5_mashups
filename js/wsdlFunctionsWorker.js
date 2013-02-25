const PHP_WSDL_FUNC = '../php/wsdlFunctions.php?wsdl=';

self.onmessage = function(e) {
    self.postMessage(getWsdlFunctions(e.data));
};

function getWsdlFunctions(input) {
    // var wsdl = '"' + input + '"';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', PHP_WSDL_FUNC + input, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

