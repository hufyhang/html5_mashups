/* global $ch */
$ch.require(['ui', 'event', 'widget', 'node']);

var SRC = 'http://feifeihang.info/hyperportal';
var WIDGET = 'descriptions';
var KEY = 'keywords';

var template = $ch.find('#widget-template').html();

$ch.find('header').topbar($ch.find('#container'));

$ch.event.listen('update', function () {
  'use strict';
  var v = $ch.view({
    html: function () {
      var spec = {
        src: SRC,
        widget: WIDGET,
        key: KEY,
        data: $ch.source('input')
      };

      return $ch.template(template, spec);
    }
  });
  $ch.find('#container').view(v);

  var node = $ch.find('#container').node();
  var btn = $ch.node('div', 'Next');
  btn.attr('ch-ui-button', '');
  btn.attr('ch-click', '$ch.event.emit("result")');
  node.appendNode(btn);
});

$ch.event.listen('result', function () {
  'use strict';
  var data = $ch.widget.tunnel.get('widget', 'doc-meta').lang;

  var v = $ch.view({
    html: function () {
      var spec = {
        src: 'http://feifeihang.info/hyperportal/widget/qr_code',
        widget: 'qr code',
        key: 'content',
        data: data
      };

      return $ch.template(template, spec);
    }
  });
  $ch.find('#result-div').view(v);
});
