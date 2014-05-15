/* global define, Ribs */
define(function () {
  'use strict';
  var search = Ribs.Model.make({
    fetch: {
      url: 'http://feifeihang.info/hypermash/portal/php/search.php',
      method: 'POST'
    }
  });

  return {
    Search: search
  };
});
