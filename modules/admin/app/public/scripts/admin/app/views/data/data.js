/*eslint-env amd*/
/*eslint camelcase:0*/
define([
        "underscore",
        "backbone",
        "app/views/utils",
        "moment"], function(_, Backbone, utils, moment) {
    "use strict";
    var DataView = utils.ParentView.extend({
        tagName: "div",
        events: {
            "click .older": "olderData",
            "click .newer": "newerData",
            "click .today": "todayData",
            "dp.change .start-date": "changeStartDate",
            "dp.change .end-date": "changeEndDate"
        },
        initialize: function() {
            var dateFormat = "DD/MM/YYYY HH:mm";
            this.$el.find(".time-control").datetimepicker({
                language: "fr",
                sideBySide: true,
                dateFormat: dateFormat
            });

            this.todayData();

            utils.ParentView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            //$(".bootstrap-datetimepicker-widget").remove();
            this.updateDateTimePicker();
            var self = this;
            this.collection.getDataByDate(this.startDate, this.endDate, function(datedData) {
                var collection = _.chain(datedData).groupBy(function(num, index) {
                    return Math.floor(index / this.numPerLine);
                }.bind(this)).toArray().value();

                collection.cols = Math.floor(12 / this.numPerLine);

                collection.startDate = this.startDate;
                collection.endDate = this.endDate;
                collection.filters = this.collection.filters;

                self.$el.find(".data-content").html(self.template(collection));
            }.bind(this));

            return this;
        },
        updateDateTimePicker: function(){
            this.$el.find(".start-date").data("DateTimePicker").setDate(this.startDate);
            this.$el.find(".end-date").data("DateTimePicker").setDate(this.endDate);
        },
        olderData: function(event) {
            event.preventDefault();
            var diff = moment(this.endDate).diff(this.startDate);

            this.endDate = this.startDate;
            this.startDate = moment(this.startDate).subtract(diff, "milliseconds").toDate();

            this.render();
        },
        newerData: function(event) {
            event.preventDefault();

            var diff = moment(this.endDate).diff(this.startDate);

            this.startDate = this.endDate;
            this.endDate = moment(this.startDate).add(diff, "milliseconds").toDate();

            this.render();
        },
        todayData: function(event) {
            var diff;

            if (event) {
                event.preventDefault();
            }

            if (!this.endDate || !this.startDate) {
                this.endDate = moment().hours(24).minutes(0).seconds(0).toDate();
                this.startDate = moment(this.endDate).subtract(3, "days").toDate();
            } else {
                diff = moment(this.endDate).diff(this.startDate);
                this.endDate = moment().hours(24).minutes(0).seconds(0).toDate();
                this.startDate = moment(this.startDate).subtract(diff, "milliseconds").toDate();
            }

            this.render();
        },
        changeStartDate: function(event) {
            this.startDate = this.$(event.target).data("DateTimePicker").getDate().toDate();
            this.render();
        },
        changeEndDate: function(event) {
            this.endDate = this.$(event.target).data("DateTimePicker").getDate().toDate();
            this.render();
        }
    });

    return DataView;
});
