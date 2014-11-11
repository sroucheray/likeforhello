define([
    "hbs!views/admin/partials/dashboards",
    "app/views/utils",
    "app/models",
    "app/views/dashboards/modules",
    "app/views/dashboards/results",
], function(template, utils, models, DashboardModulesView, DashboardResultsView) {
    "use strict";





    var DashBoardView = utils.ParentView.extend({
        tagName: "div",
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            this.render();
        },
        template: template,
        render: function() {
            var html = this.template();
            this.$el.html(html);

            var dashboardModulesView = new DashboardModulesView({
                collection: models.collections.modules
            });

            var dashboardResultsView = new DashboardResultsView({
                collection: models.collections.statistics
            });

            this.$el.find(".dashboard-content")
                .append(dashboardModulesView.render().$el)
                .append(dashboardResultsView.$el);

            return this;
        }
    });

    return DashBoardView;
});