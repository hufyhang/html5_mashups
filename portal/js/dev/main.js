/* global require, Ribs */
require(['marketView'], function (MarketView) {
  'use strict';

  var view = Ribs.make(MarketView.View);
  Ribs.Router.route({
    'home': function () {
      view.render();
    }
  });

  Ribs.Router.navigate('home');
});
