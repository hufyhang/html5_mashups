/* global $ch */
$ch.require(['context', 'event']);

var SEARCH_PHP = 'http://feifeihang.info/hypermash/portal/php/search.php';

var resultFilter = function (item) {
  'use strict';
  var keys = $ch.source('search') || '';
  keys = keys.toUpperCase();
  return item.description.toUpperCase().indexOf(keys) > -1;
};

$ch.http({
  url: SEARCH_PHP,
  method: 'post',
  data: {
    keywords: ''
  },
  done: function (res) {
    'use strict';
    if (res.status === 200) {
      var resultData = res.data;
      if (resultData !== '{"projects": ]}' && resultData !== '{"projects": ]}\n') {
        var projects = JSON.parse(resultData).projects;
        $ch.each(projects, function (item) {
          item.contextDesc = 'http://feifeihang.info/hypermash/projects/rdfa.php?lang=' +
          $ch.context.language + '&uid=';
          item.description = item.description.replace(/\$quot;/g, '"');
        });
        $ch.source('results', projects);
      } else {
        $ch.source('results', []);
      }

      $ch.event.emit('search');
    }
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
  $ch.find('#inline-result').inline();
});
