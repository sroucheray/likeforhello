/*eslint-env amd*/
/*eslint camelcase:0*/
define([
    "underscore",
    "app/views/data/data",
    "hbs!/views/admin/partials/data/default",
    "hbs!/views/admin/partials/data/statistics"
], function(_, DataView, layoutTemplate, contentTemplate) {
    "use strict";
    var VisitorsView = DataView.extend({
        tagName: "div",
        numPerLine: 3,
        filters: {},
        events: function() {
            return _.extend({}, DataView.prototype.events, {
                "click .filter-all": "clickFilterAll",
                "click .filter-queue": "clickFilterQueue"
            });
        },
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Statistiques"
            }));

            //this.$el.find(".data-filters .navbar-form").append(filtersTemplate());
            //this.$el.find(".filter-all").button("toggle");

            DataView.prototype.initialize.apply(this, arguments);

            this.collection.filters = {};

            /*this.collection.filterFunc = function(item) {
                if (this.filters.queue) {
                    return !!item.QueueId;
                }

                return true;
            }.bind(this.collection);*/
        },
        template: contentTemplate,
        clickFilterAll: function() {
            this.collection.filters.queue = false;
            this.render();
        },
        clickFilterQueue: function() {
            this.collection.filters.queue = true;
            this.render();
        }
    });

    return VisitorsView;
});


require(['goog!visualization,1,packages:[corechart,geochart]', 'goog!search,1'], function(){

                // visualization + corechart + geochart + search are loaded


                // code copied from google charts docs:
                // http://code.google.com/apis/chart/interactive/docs/gallery/piechart.html
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Task');
                data.addColumn('number', 'Hours per Day');
                data.addRows(5);
                data.setValue(0, 0, 'Work');
                data.setValue(0, 1, 11);
                data.setValue(1, 0, 'Eat');
                data.setValue(1, 1, 2);
                data.setValue(2, 0, 'Commute');
                data.setValue(2, 1, 2);
                data.setValue(3, 0, 'Watch TV');
                data.setValue(3, 1, 2);
                data.setValue(4, 0, 'Sleep');
                data.setValue(4, 1, 7);

                var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
                chart.draw(data, {width: 450, height: 300, title: 'My Daily Activities'});


                // code copied from google charts docs:
                // http://code.google.com/apis/chart/interactive/docs/gallery/geochart.html
                var data = new google.visualization.DataTable();
                data.addRows(6);
                data.addColumn('string', 'Country');
                data.addColumn('number', 'Popularity');
                data.setValue(0, 0, 'Germany');
                data.setValue(0, 1, 200);
                data.setValue(1, 0, 'United States');
                data.setValue(1, 1, 300);
                data.setValue(2, 0, 'Brazil');
                data.setValue(2, 1, 400);
                data.setValue(3, 0, 'Canada');
                data.setValue(3, 1, 500);
                data.setValue(4, 0, 'France');
                data.setValue(4, 1, 600);
                data.setValue(5, 0, 'RU');
                data.setValue(5, 1, 700);

                var options = {};

                var container = document.getElementById('map_canvas');
                var geochart = new google.visualization.GeoChart(container);
                geochart.draw(data, options);



                //code copied from http://code.google.com/apis/ajax/playground/?exp=libraries#the_hello_world_of_news_search
                //and slightly modified

                var newsSearch = new google.search.WebSearch(),
                    resultHolder = document.getElementById('search_results');

                function searchComplete() {
                  resultHolder.innerHTML = '';
                  if (newsSearch.results && newsSearch.results.length > 0) {
                    for (var i = 0; i < newsSearch.results.length; i++) {
                      var p = document.createElement('p');
                      var a = document.createElement('a');
                      a.href = newsSearch.results[i].url;
                      a.innerHTML = newsSearch.results[i].title;
                      p.appendChild(a);
                      resultHolder.appendChild(p);
                    }
                  }
                }

                newsSearch.setSearchCompleteCallback(this, searchComplete, null);
                newsSearch.execute('RequireJS plugins');

                // Include the required Google branding
                google.search.Search.getBranding('branding');

            });