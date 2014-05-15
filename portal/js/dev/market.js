/* global define, Ribs */
define(function () {
  'use strict';
  var MARKET_PHP = 'http://feifeihang.info/hypermash/portal/php/loadProjectMarket.php';

  var market = Ribs.Model.make({
    fetch: {
      url: MARKET_PHP,
      method: 'GET'
    }
  });

  return {
    Market: market
  };
});
