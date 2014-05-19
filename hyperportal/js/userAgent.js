/* global $ch */
$ch.define('userAgent', function () {
  'use strict';

  var getherUserAgentInfo = function () {
    var language = window.navigator.userLanguage || window.navigator.language;
    return {
      lang: language
    };
  };

  return {
    meta: getherUserAgentInfo()
  };
});
