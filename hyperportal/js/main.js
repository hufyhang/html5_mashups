/* global $ch */

var resultFilter = function (item) {
  'use strict';
  var keys = $ch.source('search') || '';
  keys = keys.trim();
  keys = keys.toUpperCase();
  return item.description.toUpperCase().indexOf(keys) > -1;
};

$ch.require(['context', 'ui', 'event', './router', 'widget'], function () {
  'use strict';

  var SEARCH_PHP = 'http://feifeihang.info/hypermash/portal/php/search.php';
  var isFromHome = false;

  $ch.find('#home-input').focus();

  window.onscroll = function () {
    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    if (top === 0) {
      $ch.find('#goto-top').css('display', 'none');
    } else {
      $ch.find('#goto-top').css('display', 'initial');
    }
  };

  $ch.find('#goto-top').css('display', 'none').click(function () {
    window.scrollTo(0, 0);
  });

  $ch.event.listen('process', function () {
    var keys = $ch.source('search').split(' ');
    $ch.router.navigate('search/' + keys.join('+'));
  });

  $ch.event.listen('search', function () {
    $ch.find('.home-div').hide();
    $ch.find('.panels').show();
    $ch.find('#search-input').focus();

    $ch.find('#inline-result').inline();
  });

  $ch.event.listen('home', function () {
    isFromHome = true;

    $ch.http({
      url: SEARCH_PHP,
      method: 'post',
      data: {
        keywords: ''
      },
      cache: true,
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

  // register Chop.js widgets
  $ch.widget.register({
    'descriptions': function (data) {
      var res = $ch.http({
        url: SEARCH_PHP,
        method: 'post',
        data: {
          keywords: ''
        },
        async: false
      }).responseText;

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

      $ch.widget.tunnel.set('doc-meta', {
        lang: $ch.context.language
      });
      return $ch.view({
        html: html
      });
    }
  });

  // to be removed when new UI module is ready on CDN
  // $ch._loadView();

  $ch.router.add({
    'search': function () {
      $ch.source('search', '');
      if (isFromHome === false) {
        $ch.event.emit('home');
      } else {
        $ch.event.emit('search');
      }
    },

    'search/:q': function (param) {
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


});

