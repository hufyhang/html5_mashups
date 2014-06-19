/* global $ch */

$ch.require('widget');

var API = 'http://www.esponce.com/api/v3/generate?format=png&content=';

$ch.widget.register({
  'qr code': function (data) {
    'use strict';
    var url = API + data.content;
    var v = $ch.view({
      html: '<img src="' + url + '" alt="QR Code"/>'
    });
    return v;
  }
});
