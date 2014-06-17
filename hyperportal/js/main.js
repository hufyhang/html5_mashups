/* global $ch */
$ch.require(['context', 'ui', 'event', 'router', 'service']);

var SEARCH_PHP = 'http://feifeihang.info/hypermash/portal/php/search.php';
var isFromHome = false;

var resultFilter = function (item) {
  'use strict';
  var keys = $ch.source('search') || '';
  keys = keys.trim();
  keys = keys.toUpperCase();
  return item.description.toUpperCase().indexOf(keys) > -1;
};

$ch.find('#home-input').focus();

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
    $ch.source('search', '');
    if (isFromHome === false) {
      $ch.event.emit('home');
    } else {
      $ch.event.emit('search');
    }
  },
  'search/:q': function (param) {
    'use strict';
    if (isFromHome === false) {
      var keys = param.q.split('+');
      $ch.source('search', keys.join(' '));

      $ch.event.emit('home');
    } else {
      var keywords = param.q.split('+');
      $ch.source('search', keywords.join(' '));

      $ch.event.emit('search');
    }
  }
});

$ch.event.listen('process', function () {
  'use strict';
  var keys = $ch.source('search').split(' ');
  $ch.router.navigate('search/' + keys.join('+'));
});

$ch.event.listen('search', function () {
  'use strict';
  $ch.find('.home-div').hide();
  $ch.find('.panels').show();
  $ch.find('#search-input').focus();

  $ch.find('#inline-result').inline();
});

$ch.event.listen('home', function () {
  'use strict';
  isFromHome = true;

  $ch.http({
    url: SEARCH_PHP,
    method: 'post',
    data: {
      keywords: ''
    },
    done: function (res) {
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

        $ch.event.emit('process');
      }
    }
  });
});



// add Chop.js service
$ch.service.add('descriptions', function (data) {
  'use strict';
  console.log('Chop.js Service');
  console.log(data);

  var res = $ch.http({
    url: SEARCH_PHP,
    method: 'post',
    data: {
      keywords: ''
    },
    async: false
  });

  var resultData = res;
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

  $ch.source('search', data.keywords);
  $ch.find('#inline-result').inline();

  var html = $ch.find('#inline-result').html();
  return $ch.view({html: html});
});

