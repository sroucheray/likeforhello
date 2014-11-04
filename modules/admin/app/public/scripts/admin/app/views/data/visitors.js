/*eslint-env amd*/
/*eslint camelcase:0*/
define(["app/views/data/data", "hbs!/views/admin/partials/data/default", "hbs!/views/admin/partials/data/visitors"], function(DataView, layoutTemplate, contentTemplate) {
    "use strict";
    var VisitorsView = DataView.extend({
        tagName: "div",
        numPerLine: 3,
        initialize: function() {
            this.$el.html(layoutTemplate({
                title: "Visiteurs"
            }));
            DataView.prototype.initialize.apply(this, arguments);
        },
        template: contentTemplate
    });

    return VisitorsView;
});
