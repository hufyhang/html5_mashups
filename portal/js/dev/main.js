/* global require, Ribs */
require(['marketView'], function (MarketView) {
  'use strict';

  var view = Ribs.make(MarketView.View);

  $('#goto-top').on('click', function () {
    window.scrollTo(0, 0);
  });

  Ribs.Router.route({
    'home': function () {
      view.render();
    }
  });

  Ribs.Router.navigate('home');
});
