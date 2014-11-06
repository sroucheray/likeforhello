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
        filters: {},
        events: function() {
            return _.extend({}, DataView.prototype.events, {
                "click .filter-all": "clickFilterAll",
                "click .filter-queue": "clickFilterQueue"
            });
        },
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Visiteurs"
            }));

            this.$el.find(".data-filters .navbar-form").append(filtersTemplate());
            //this.$el.find(".filter-all").button("toggle");

            DataView.prototype.initialize.apply(this, arguments);

            this.collection.filters = {};

            this.collection.filterFunc = function(item) {
                if (this.filters.queue) {
                    return !!item.QueueId;
                }

                return true;
            }.bind(this.collection);
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
