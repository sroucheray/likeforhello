/*eslint-env amd*/
/*eslint camelcase:0*/
define([
        "underscore",
        "jquery",
        "app/views/data/data",
        "hbs!views/admin/partials/data/default",
        "hbs!views/admin/partials/data/photos"], function(
            _,
            $,
            DataView,
            layoutTemplate,
            contentTemplate) {
    "use strict";
    var PhotosView = DataView.extend({
        tagName: "div",
        numPerLine: 5,
        events: function() {
            return _.extend({}, DataView.prototype.events, {
                "click .data-republish": "republish"
            });
        },
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Photos"
            }));
            DataView.prototype.initialize.apply(this, arguments);
        },
        template: contentTemplate,
        republish: function(event){
            $(event.target).attr("disabled", "disabled");
            this.collection.publishPhoto($(event.target).data("filename"), $(event.target).data("hello"), function(data){
                console.log("publish", arguments);
            });
        }
    });

    return PhotosView;
});
