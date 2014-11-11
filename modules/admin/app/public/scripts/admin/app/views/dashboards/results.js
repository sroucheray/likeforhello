/*eslint-env amd*/
/*eslint camelcase:0*/
define([
    "underscore",
    "moment",
    "jquery",
    "app/views/data/data",
    "hbs!views/admin/partials/dashboards/scores"
], function(_, moment, $, DataView, scoresTemplate) {
    "use strict";
    var StatisticsView = DataView.extend({
        tagName: "div",
        numPerLine: 3,
        filters: {},
        events: function() {
        },
        initialize: function() {
            DataView.prototype.initialize.apply(this, arguments);

            this.collection.filters = {};
        },
        render: function() {
            var self = this;
            this.collection.getAllData(function(data) {
                this.data = data;
                self.createCharts(data);
            }.bind(this));

            return this;
        },
        createCharts: function(data) {
            var score = {
                teamA: {
                    score: _.reduce(data, function(memo, datum) {
                        return datum["Equipe A"] + memo;
                    }, 0),
                    name: "Achats, Comptabilité, RH..."
                },
                teamB: {
                    score: _.reduce(data, function(memo, datum) {
                        return datum["Equipe B"] + memo;
                    }, 0),
                    name: "Communication, Marketing..."
                },
                teamC: {
                    score: _.reduce(data, function(memo, datum) {
                        return datum["Equipe C"] + memo;
                    }, 0),
                    name: "Commerciaux grand public..."
                }
            };

            this.$el = this.template(score);
            $(".dashboard-content").append(this.template(score));

        },
        template: scoresTemplate
    });

    return StatisticsView;
});
