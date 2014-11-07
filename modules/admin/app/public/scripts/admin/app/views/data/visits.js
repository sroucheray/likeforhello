/*eslint-env amd*/
/*global google*/
/*eslint camelcase:0*/
define([
    "underscore",
    "moment",
    "app/views/data/data",
    "hbs!views/admin/partials/data/default-nofilters",
    "hbs!views/admin/partials/data/statistics",
    "hbs!views/admin/partials/data/scores",
    "goog!visualization,1,packages:[corechart]"
], function(_, moment, DataView, layoutTemplate, contentTemplate, scoresTemplate) {
    "use strict";
    var StatisticsView = DataView.extend({
        tagName: "div",
        numPerLine: 3,
        filters: {},
        events: function() {
            return _.extend({}, DataView.prototype.events, {
                "click .statistics-refresh": "render",
            });
        },
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Résultats"
            }));

            this.$el.find(".data-content").html(contentTemplate());
            //this.$el.find(".filter-all").button("toggle");

            DataView.prototype.initialize.apply(this, arguments);

            this.collection.filters = {};
            //this.listenToOnce(this.collection, "sync", console.log);

            /*this.collection.filterFunc = function(item) {
                if (this.filters.queue) {
                    return !!item.QueueId;
                }

                return true;
            }.bind(this.collection);*/




        },
        render: function() {
            var self = this;
            this.collection.getAllData(function(data) {
                self.createCharts(data);
            }.bind(this));

            return this;
        },
        todaydata: function() {

        },
        createCharts: function(data) {
            // visualization + corechart + geochart + search are loaded


            // code copied from google charts docs:
            // http://code.google.com/apis/chart/interactive/docs/gallery/piechart.html
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn("date", "Hour");
            dataTable.addColumn("number", "Visitors"); //Equipe A  bleu #5EFF29


            //this.$el.find(".statistics-score").html(scoresTemplate(score));


            function maxInDatum(datum) {
                return _.max([datum["Equipe A"], datum["Equipe B"], datum["Equipe C"]]);
            }

            var maxVal = _.max(data, function(datum) {
                return maxInDatum(datum);
            });

            maxVal = maxInDatum(maxVal) + 2;

            _(data).each(function(datum) {
                dataTable.addRow([
                    new Date(datum.Hour),
                    datum.Visitors
                ]);
            });

            var visitView = new google.visualization.DataView(dataTable);
            visitView.setColumns([0, 1, 2, 3]);

            var teamChart = new google.visualization.LineChart(this.$(".statistic-team").get(0));
            teamChart.draw(visitView, {
                height: 300,
                chartArea: {
                    left: 30
                },
                title: "Visits par heure",
                vAxis: {
                    gridlines: {
                        count: -1
                    },
                    ticks: _.range(maxVal)
                },
                legend: {
                    position: "none"
                },
                colors: ["#66CC66", "#FFCC00", "#0099CC"]
            });

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

    return StatisticsView;
});
