/* global define, Ribs, _ */
define(['market'], function (Market) {
  'use strict';
  var M = Ribs.make(Market.Market);

  var view = Ribs.View.make({
    el: $('.panels'),
    template: $('#panel-template').html(),
    render: function () {
      M.fetch({
        done: function (data) {
          view.renderData(data);
        }
      });
    }
  });

  view.renderData = function (data) {
    if (data === '{"projects": ]}' || data === '{"projects": ]}\n') {
      view.el.html('<i>Oops... We found nothing on our server...</i>');
      return;
    }

    var json = JSON.parse(data);

    console.log(json);

    for (var item in json.projects) {
      if (json.projects.hasOwnProperty(item)) {
        var tar = json.projects[item];
        tar.description = tar.description.replace(/\$quot;/g, '"');
      }
    }

    view.el.html(_.template(view.template, {data: json.projects}));
  };

  return {
    View: view
  };
});
