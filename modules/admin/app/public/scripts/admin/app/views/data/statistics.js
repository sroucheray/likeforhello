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
                "click .statistics-refresh": "render"
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
            dataTable.addColumn("date", "Jour");
            dataTable.addColumn("number", "Achats, Comptabilité, Juridique, RH, Direction"); //Equipe A  bleu #5EFF29
            dataTable.addColumn("number", "Communication,  Marketing et Revenue Management"); //Equipe B jaune ##FFAA00
            dataTable.addColumn("number", "Commerciaux grand public et groupes"); //Equipe C vert #00FFAA
            dataTable.addColumn("number", "2ème étage");
            dataTable.addColumn("number", "1er étage");
            dataTable.addColumn("number", "RDC");


            var score = {
                teamA: _.reduce(data, function(memo, datum) {
                    return datum["Equipe A"] + memo;
                }, 0),
                teamB: _.reduce(data, function(memo, datum) {
                    return datum["Equipe B"] + memo;
                }, 0),
                teamC: _.reduce(data, function(memo, datum) {
                    return datum["Equipe C"] + memo;
                }, 0)
            };

            this.$el.find(".statistics-score").html(scoresTemplate(score));


            function maxTeamInDatum(datum) {
                return _.max([datum["Equipe A"], datum["Equipe B"], datum["Equipe C"]]);
            }

            var maxVal = _.max(data, function(datum) {
                return maxTeamInDatum(datum);
            });

            maxVal = maxTeamInDatum(maxVal) + 2;

            _(data).each(function(datum) {
                dataTable.addRow([
                    new Date(datum.id),
                    datum["Equipe A"],
                    datum["Equipe B"],
                    datum["Equipe C"],
                    datum["2ème étage"],
                    datum["1er étage"],
                    datum["Rez-de-Chaussée"]
                ]);
            });

            var teamView = new google.visualization.DataView(dataTable);
            teamView.setColumns([0, 1, 2, 3]);

            var teamChart = new google.visualization.LineChart(this.$(".statistic-team").get(0));
            teamChart.draw(teamView, {
                height: 300,
                chartArea: {
                    left: 30
                },
                title: "Scores quotidiens",
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






            function maxStageInDatum(datum) {
                return _.max([datum["Rez-de-Chaussée"], datum["1er étage"], datum["2ème étage"]]);
            }

            maxVal = _.max(data, function(datum) {
                return maxStageInDatum(datum);
            });

            maxVal = maxStageInDatum(maxVal) + 2;



            var stageView = new google.visualization.DataView(dataTable);
            stageView.setColumns([0, 4, 5, 6]);

            var stageChart = new google.visualization.LineChart(this.$(".statistic-stage").get(0));
            stageChart.draw(stageView, {
                height: 300,
                title: "Résultats à tous les étages",
                vAxis: {
                    gridlines: {
                        count: -1
                    },
                    ticks: _.range(maxVal)
                },
                chartArea: {
                    left: 30
                }
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
