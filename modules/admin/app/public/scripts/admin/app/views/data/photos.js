/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!/views/admin/partials/data/photos", "underscore", "backbone", "app/views/utils"], function(template, _, Backbone, utils) {
    "use strict";
    var SettingsView = utils.ParentView.extend({
        tagName: "div",
        numPerLine: 5,
        currentPage: 0,
        events: {
            "click .pagination .older": "nextData",
            "click .pagination .newer": "prevData"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            //this.listenTo(this.collection, "sync", this.render);
            /*
            this.listenTo(this.collection, "update", this.render);*/

            /*this.listenTo(this.collection, "all", function() {
                console.log(arguments);
            });*/
            this.render();
        },
        template: template,
        render: function() {
            var self = this;
            this.collection.getPage(this.collection.page, function(pagedColl) {
                var collection = _.chain(pagedColl).groupBy(function(num, index) {
                    return Math.floor(index / this.numPerLine);
                }.bind(this)).toArray().value();
                collection.cols = Math.floor(12 / this.numPerLine);

                self.$el.html(self.template(collection));
            });




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