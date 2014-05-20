/* global $ch */
$ch.require('userAgent');
var AGENT = $ch.module('userAgent').meta;

var SEARCH_PHP = 'http://feifeihang.info/hypermash/portal/php/search.php';
var PANEL_TEMPLATE = $ch.find('#panel-template').html();
var TAIL_TEMPLATE = $ch.find('#tail-template').html();

var resultModel = $ch.model({});

var resultData = $ch.http({
  url: SEARCH_PHP,
  method: 'post',
  data: {
    keywords: ''
  },
  async: false
});

if (resultData !== '{"projects": ]}' && resultData !== '{"projects": ]}\n') {
  resultModel.set(JSON.parse(resultData));
}



var doSearch = function () {
  'use strict';
  $ch.router.navigate('search');
};

var resultView = $ch.view({
  html: function () {
    'use strict';
    var html = '';

    if (resultModel.get().length === 0) {
      html = '<i>Oops... We found nothing on our server...</i>';
    } else {
      // var keys = $ch.source('search') || '';
      var expr = '';
      expr += 'var keys = $ch.source("search") || "";';
      expr += 'keys = keys.toUpperCase();';
      expr += '$$.description.toUpperCase().indexOf(keys) > -1';
      var projects = resultModel.filter('projects', expr);
      for (var index = 0, l = projects.length; index !== l; ++index) {
        var param = projects[index];
        param.contextDesc = 'http://feifeihang.info/hypermash/projects/rdfa.php?lang=' + AGENT.lang + '&uid=';
        param.description = param.description.replace(/\$quot;/g, '"');
        html += $ch.template(PANEL_TEMPLATE, param);
      }
    }

    html += $ch.template(TAIL_TEMPLATE);
    return html;
  }
});

$ch.find('#search-input').focus();

window.onscroll = function () {
  'use strict';
  var doc = document.documentElement;
  var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
  if (top === 0) {
    $ch.find('#goto-top').css('display', 'none');
  } else {
    $ch.find('#goto-top').css('display', 'initial');
  }
};

$ch.find('#goto-top').css('display', 'none').click(function () {
  'use strict';
  window.scrollTo(0 ,0);
});

$ch.router.add({
  'search': function () {
    'use strict';
    $ch.find('.panels').view(resultView);
  }
});

