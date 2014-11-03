/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!/views/admin/partials/data/photos", "underscore", "backbone", "app/views/utils", "moment"], function(template, _, Backbone, utils, moment) {
    "use strict";
    var SettingsView = utils.ParentView.extend({
        tagName: "div",
        numPerLine: 5,
        currentPage: 0,
        events: {
            "click .older": "olderData",
            "click .newer": "newerData",
            "click .today": "todayData",
            "dp.change .start-date": "changeStartDate",
            "dp.change .end-date": "changeEndDate"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);

            this.todayData();
        },
        template: template,
        render: function() {
            var dateFormat = "DD/MM/YYYY HH:mm";

            console.log("Start", this.startDate);
            console.log("End", this.endDate);

            var self = this;
            this.collection.getDataByDate(this.startDate, this.endDate, function(datedPhotos) {
                var collection = _.chain(datedPhotos).groupBy(function(num, index) {
                    return Math.floor(index / this.numPerLine);
                }.bind(this)).toArray().value();
                collection.cols = Math.floor(12 / this.numPerLine);

                collection.startDate = this.startDate;
                collection.endDate = this.endDate;

                self.$el.html(self.template(collection));

                self.$el.find(".time-control").datetimepicker({
                    language: "fr",
                    sideBySide: true,
                    dateFormat: dateFormat
                });
            }.bind(this));

            return this;
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
                this.startDate = moment(this.endDate).subtract(1, "days").toDate();
            } else {
                diff = moment(this.endDate).diff(this.startDate);
                this.endDate = new Date();
                this.startDate = moment(this.startDate).substract(diff, "milliseconds").toDate();
            }

            this.render();
        },
        changeStartDate: function(event) {
            this.startDate = this.$(event.target).data("DateTimePicker").getDate().valueOf();
            this.render();
        },
        changeEndDate: function(event) {
            this.endDate = this.$(event.target).data("DateTimePicker").getDate().valueOf();
            this.render();
        }
    });

    return SettingsView;
});
