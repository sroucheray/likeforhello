/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!/views/admin/partials/data/photos", "underscore", "backbone", "app/views/utils", "moment"], function(template, _, Backbone, utils, moment) {
    "use strict";
    var SettingsView = utils.ParentView.extend({
        tagName: "div",
        numPerLine: 5,
        currentPage: 0,
        events: {
            "click .pagination .older": "nextData",
            "click .pagination .newer": "prevData",
            "click .pagination .today": "todayData"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);

            this.endDate = new Date();
            this.startDate = moment(this.endDate).subtract(1, "days").toDate();

            this.$el.find(".time-control").datetimepicker({
                language: "fr",
                sideBySide: true,
                dateFormat: "DD MMMM YYYY"
            });


            this.render();
        },
        template: template,
        render: function() {
            var self = this;
            this.collection.getDataByDate(this.startDate, this.endDate, function(datedPhotos) {
                var collection = _.chain(datedPhotos).groupBy(function(num, index) {
                    return Math.floor(index / this.numPerLine);
                }.bind(this)).toArray().value();
                collection.cols = Math.floor(12 / this.numPerLine);

                this.collection.startDate = moment(this.startDate).format("DD MMMM YYYY");
                this.collection.endDate = moment(this.endDate).format("DD MMMM YYYY");

                self.$el.html(self.template(collection));
            }.bind(this));

            return this;
        },
        nextData: function(event) {
            event.preventDefault();
            this.currentPage++;
            this.collection.page = this.currentPage;
            this.render();
        },
        prevData: function(event) {
            event.preventDefault();
            this.currentPage--;
            this.collection.page = this.currentPage;
            this.render();
        }
    });

    return SettingsView;
});