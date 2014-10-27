/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!views/partials/data/visitors", "underscore", "backbone", "app/views/utils", "moment", "moment-duration-format"], function(template, _, Backbone, utils, moment) {
    "use strict";
    var VisitorsView = utils.ParentView.extend({
        tagName: "div",
        numPerLine: 4,
        events: {
            "change #isPaused": "changeSetting",
            "change #minRealertDelay": "changeSetting",
            "change #maxRealertDelay": "changeSetting",
            "change #minVisitorQueueLength": "changeSetting",
            "change #maxVisitorQueueLength": "changeSetting",
            "dp.change #startDate": "changeSetting",
            "dp.change #endDate": "changeSetting"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, "sync", this.render);
            this.listenTo(this.collection, "update", this.render);
            this.listenTo(this.collection, "all", function() {
                console.log(arguments);
            });
            this.collection.fetch({
                data: {
                    collName: "visitors",
                    offset: this.collection.offset,
                    limit: this.collection.limit
                }
            });
        },
        template: template,
        render: function() {
            var collection = this.collection.toJSON();
            collection = _.chain(collection).groupBy(function(num, index) {
                return Math.floor(index / this.numPerLine);
            }.bind(this)).toArray().value();

            console.log(collection)
            collection.cols = Math.floor(12 / this.numPerLine);

            this.$el.html(this.template(collection));


            return this;
        }
    });

    return VisitorsView;
});