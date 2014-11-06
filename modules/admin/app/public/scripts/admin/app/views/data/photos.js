/*eslint-env amd*/
/*eslint camelcase:0*/
define(["app/views/data/data", "hbs!views/admin/partials/data/default", "hbs!views/admin/partials/data/photos"], function(DataView, layoutTemplate, contentTemplate) {
    "use strict";
    var PhotosView = DataView.extend({
        tagName: "div",
        numPerLine: 5,
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Photos"
            }));
            DataView.prototype.initialize.apply(this, arguments);
        },
        template: contentTemplate
    });

    return PhotosView;
});
