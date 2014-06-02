/* global $ch */
$ch.require(['module/context', 'module/event']);

var SEARCH_PHP = 'http://feifeihang.info/hypermash/portal/php/search.php';
var PANEL_TEMPLATE = $ch.find('#panel-template').html();
var TAIL_TEMPLATE = $ch.find('#tail-template').html();

var results;

var resultView = $ch.view({
  html: function () {
    'use strict';
    var html = '';

    if (results === undefined) {
      var resultData = $ch.http({
        url: SEARCH_PHP,
        method: 'post',
        data: {
          keywords: ''
        },
        async: false
      });

      if (resultData !== '{"projects": ]}' && resultData !== '{"projects": ]}\n') {
        results = JSON.parse(resultData);
      } else {
        results = {projects: []};
      }
    }

    var projects = $ch.filter(results.projects, function (data) {
      var keys = $ch.source('search') || '';
      keys = keys.toUpperCase();
      return data.description.toUpperCase().indexOf(keys) > -1;
    });

    if (projects.length === 0) {
      html = '<i>Oops... We found nothing on our server...</i>';
    } else {
      for (var index = 0, l = projects.length; index !== l; ++index) {
        var param = projects[index];
        param.contextDesc = 'http://feifeihang.info/hypermash/projects/rdfa.php?lang=' + $ch.context.language + '&uid=';
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

$ch.event.listen('search', function () {
  'use strict';
  $ch.find('.panels').view(resultView);
});
