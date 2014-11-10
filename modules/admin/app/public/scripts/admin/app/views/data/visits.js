/*eslint-env amd*/
/*global google*/
/*eslint camelcase:0*/
define([
    "underscore",
    "moment",
    "app/views/data/data",
    "hbs!views/admin/partials/data/default",
    "hbs!views/admin/partials/data/visits",
    "goog!visualization,1,packages:[corechart]"
], function(_, moment, DataView, layoutTemplate, contentTemplate) {
    "use strict";
    var VisitsView = DataView.extend({
        tagName: "div",
        numPerLine: 3,
        filters: {},
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Visites"
            }));

            this.$el.find(".data-content").html(contentTemplate());

            this.visitPerDayChart = new google.visualization.LineChart(this.$(".visits-per-day").get(0));
            this.visitPerHourChart = new google.visualization.LineChart(this.$(".visits-per-hour").get(0));

            DataView.prototype.initialize.apply(this, arguments);

            this.collection.filters = {};
        },
        render: function() {
            this.updateDateTimePicker();
            if (this.collectedData) {
                this.createCharts();
                return;
            }
            this.collection.getAllData(function(data) {
                this.collectedData = this.fillInGaps(data, "Hour", 1000 * 60 * 60);
                this.collectedDataPerDay = this.computeDataPerDay(this.collectedData);
                this.createCharts();
            }.bind(this));

            return;
        },
        createCharts: function() {
            var startTime = this.startDate.getTime(),
                endTime = this.endDate.getTime(),
                data = this.collectedDataPerDay,
                dataPerHourTable = new google.visualization.DataTable();

            if (endTime - startTime <= 3 * 24 * 60 * 60 * 1000) {
                data = this.collectedData;
                dataPerHourTable.addColumn("datetime", "Hour");
            } else {
                dataPerHourTable.addColumn("date", "Hour");

            }

            dataPerHourTable.addColumn("number", "Nb de visites");

            data = _.filter(data, function(datum) {
                var date = moment(datum.Hour, "YYYY-MM-DD[T]HH:mm").valueOf();

                //datum.Visitors = Math.floor(Math.random() * 50);
                return date >= startTime && date <= endTime;
            });


            var maxVal = _.max(data, function(datum) {
                return datum.Visitors;
            });
            maxVal = maxVal.Visitors + 2;

            _(data).each(function(datum) {
                var row = [
                    moment(datum.Hour, "YYYY-MM-DD[T]HH:mm").toDate(),
                    datum.Visitors
                ];
                dataPerHourTable.addRow(row);
            });

            var visitPerHourView = new google.visualization.DataView(dataPerHourTable);

            this.visitPerHourChart.draw(visitPerHourView, {
                height: 500,
                chartArea: {
                    left: 30
                },
                title: "Visites",
                vAxis: {
                    gridlines: {
                        count: 10
                    },
                    ticks: _.chain(maxVal).range().filter(function(item, index) {
                        return (index === maxVal - 1) || (index % Math.round(maxVal / 5) === 0);
                    }).value()
                }
            });

        },
        fillInGaps: function(data, key, gap) {
            var newData = [],
                lastDatum;

            _.each(data, function(nextDatum) {
                if (!lastDatum) {
                    newData.push(nextDatum);
                    lastDatum = nextDatum;

                    return;
                }
                var lastDate = moment(lastDatum[key], "YYYY-MM-DD[T]HH:mm").toDate();
                var nextDate = moment(nextDatum[key], "YYYY-MM-DD[T]HH:mm").toDate();

                var newDatum;
                for (var i = lastDate.getTime() + gap; i < nextDate.getTime(); i += gap) {
                    newDatum = {
                        Visitors: 0
                    };

                    newDatum[key] = moment(new Date(i)).format("YYYY-MM-DD[T]HH:mm");
                    newData.push(newDatum);
                }

                newData.push(nextDatum);
                lastDatum = nextDatum;
            });

            return newData;
        },
        computeDataPerDay: function(data) {
            var groupedData = _.groupBy(data, function(datum) {
                return datum.Hour.split("T")[0];
            });
            var newData = _.map(groupedData, function(group, date) {
                date = date.split("T")[0];
                var num = _.reduce(group, function(memo, datum) {
                    return memo + datum.Visitors;
                }, 0);

                return {
                    Hour: moment(date.split("T")[0]).format("YYYY-MM-DD[T]HH:mm"),
                    Visitors: num
                };
            });

            return newData;
        },
        template: contentTemplate,
        todayData: function(event) {
            var diff;

            if (event) {
                event.preventDefault();
            }

            if (!this.endDate || !this.startDate) {
                this.endDate = moment().hours(24).minutes(0).seconds(0).toDate();
                this.startDate = moment(this.endDate).subtract(7, "days").toDate();
            } else {
                diff = moment(this.endDate).diff(this.startDate);
                this.endDate = moment().hours(24).minutes(0).seconds(0).toDate();
                this.startDate = moment(this.startDate).subtract(diff, "milliseconds").toDate();
            }

            this.render();
        }
    });

    return VisitsView;
});