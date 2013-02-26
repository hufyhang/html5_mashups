const PHP_ACCESS_SOAP = '../php/soapAccess.php?';

self.onmessage = function(e) {
    self.postMessage(accessSOAP(e.data));
};

function accessSOAP(input) {
    // var wsdl = '"' + input + '"';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', PHP_ACCESS_SOAP + input, false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

