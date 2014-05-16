/* global define, Ribs */
define(['search', 'marketView'], function (Search, Market) {
  'use strict';
  var search = Ribs.make(Search.Search);
  var marketView = Ribs.make(Market.View);
  var searchHtml = '';

  searchHtml += '<div><input type="text" class="form-control" id="search-input" ';
  searchHtml += 'placeholder="keywords..."/><div class="btn btn-default" id="search-btn">Search</div></div>';

  var startSearch = function () {
    var keys = $('#search-input').val();
    search.fetch({
      data: {
        keywords: keys
      },
      done: function (data) {
        marketView.renderData(data);

      }
    });
  };

  var view = Ribs.View.make({
    el: $('.search-panel'),
    template: $('#panel-template'),
    render: function () {
      view.el.html(searchHtml);
    },
    events: {
      '#search-btn': {
        on: 'click',
        fire: 'doSearch'
      },
      '#search-input': {
        on: 'keypress',
        fire: 'keySearch'
      }
    },
    keySearch: function (evt) {
      if (evt.which === 13) {
        startSearch();
      }
    },
    doSearch: function () {
      startSearch();
    }
  });

  return {
    View: view
  };

});
