/* global require, Ribs */
require(['marketView', 'searchView'], function (MarketView, SearchView) {
  'use strict';

  var view = Ribs.make(MarketView.View);
  var search = Ribs.make(SearchView.View);

  var win = $(window);
  var gotoTop = $('#goto-top');
  gotoTop.css('display', 'none');
  win.on('scroll', function () {
    if (win.scrollTop() === 0) {
      gotoTop.hide();
    } else {
      gotoTop.show();
    }
  });

  $('#goto-top').on('click', function () {
    window.scrollTo(0, 0);
  });

  Ribs.Router.route({
    'home': function () {
      search.render();
      view.render();
    }
  });

  Ribs.Router.navigate('home');
});
