/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!views/admin/partials/dashboards", "underscore", "backbone", "app/views/utils"], function(template, _, Backbone, utils) {
    "use strict";
    var DashBoardsModulesView = utils.ParentView.extend({
        tagName: "div",
        events: {
            "click .icon": "open",
            "click .button.edit": "openEditDialog",
            "click .button.delete": "destroy"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.collection, "sync", this.render);
            this.listenTo(this.collection, "reset", this.render);
            this.collection.fetch();
        },
        template: template,
        computeStats: function() {
            var modulesGroupedByType = this.collection.groupBy(function(model) {
                return model.get("type");
            });
            var stats = {};

            _.each(modulesGroupedByType, function(modules, type) {
                var modulesConnectedStats = [];
                var modulesDisconnectedStats = [];
                var numModules = 0;
                _.each(modules, function(module) {

                    if (module.get("spared")) {
                        return;
                    }

                    numModules++;

                    if (module.get("is_connected")) {
                        modulesConnectedStats.push({
                            id: module.id,
                            is_connected: module.get("is_connected"),
                            ip: module.get("ip"),
                            connected_at: module.get("connected_at"),
                            disconnected_at: module.get("connected_at")

                        });
                    } else {
                        modulesDisconnectedStats.push({
                            id: module.id,
                            is_connected: module.get("is_connected"),
                            ip: module.get("ip"),
                            connected_at: module.get("connected_at"),
                            disconnected_at: module.get("connected_at")

                        });
                    }
                });
                stats[type] = {
                    name: type === "cam" ? "Appareils photo" : type === "alert" ? "Gyrophare" : type === "button" ? "Barre de boutons" : type,
                    type: type,
                    num: numModules,
                    modules: {
                        connected: modulesConnectedStats,
                        disconnected: modulesDisconnectedStats
                    }
                };
            });

            return {
                stats: {
                    modules: stats
                }
            };
        },
        render: function() {
            var html = this.template(this.computeStats());

            this.$el.html(html);
            return this;
        }

    });

    return DashBoardsModulesView;
});