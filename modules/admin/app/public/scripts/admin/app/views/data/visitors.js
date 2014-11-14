/*eslint-env amd*/
/*eslint camelcase:0*/
define([
    "underscore",
    "app/views/data/data",
    "hbs!views/admin/partials/data/default",
    "hbs!views/admin/partials/data/visitors",
    "hbs!views/admin/partials/data/filters/visitors"
], function(_, DataView, layoutTemplate, contentTemplate, filtersTemplate) {
    "use strict";
    var VisitorsView = DataView.extend({
        tagName: "div",
        numPerLine: 3,
        filter: false,
        events: function() {
            return _.extend({}, DataView.prototype.events, {
                "click .filter-all": "clickFilterAll",
                "click .filter-queue": "clickFilterQueue",
                "click .filter-error": "clickFilterError",
                "click .data-republish": "clickRepublish"
            });
        },
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Visiteurs"
            }));

            this.$el.find(".data-filters .navbar-form").append(filtersTemplate());
            //this.$el.find(".filter-all").button("toggle");

            DataView.prototype.initialize.apply(this, arguments);

            this.collection.filterFunc = function(item) {
                console.log(this.filter, item);
                if (this.filter === "queue") {
                    return !!item.QueueId && item.facebook_post_id;
                }

                if (this.filter === "error") {
                    return !item.QueueId && !item.facebook_post_id;
                }

                return true;
            }.bind(this);
        },
        template: contentTemplate,
        clickFilterAll: function() {
            this.filter = false;
            this.render();
        },
        clickFilterQueue: function() {
            this.filter = "queue";
            this.render();
        },
        clickFilterError: function() {
            this.filter = "error";
            this.render();
        },
        clickRepublish: function(event){
            $(event.target).attr("disabled", "disabled");
            this.collection.publishPhotoOnWall($(event.target).data("filename"), $(event.target).data("facebookid"), function(data){
                console.log("publish", arguments);
            });
        }
    });

    return VisitorsView;
});
