define(["backbone", "app/models", "app/views/body", "app/views/nav"], function(Backbone, models, bodyView, navView) {
    "use strict";

    /* Utility class */
    function ViewsTemp() {
        this.views = [];
    }

    ViewsTemp.prototype.add = function(view) {
        if (this.views.indexOf(view) === -1) {
            this.views.push(view);
            bodyView.add(view);
        }
    };

    ViewsTemp.prototype.removeAll = function() {
        for (var i = this.views.length - 1; i >= 0; i--) {
            this.views[i].close();
        }
        this.views = [];
    };

    ViewsTemp.prototype.curryRoute = function(routeMethod) {
        var self = this;

        return function() {
            var args = Array.prototype.slice.apply(arguments);
            self.removeAll();
            routeMethod.apply(self, args);
        };
    };

    var viewsTemp = new ViewsTemp();

    /* Route methods */

    function dashboard() {
        navView.activateMenu("#");
        require(["app/views/dashboards/modules"], function(DashboardModulesView) {
            var dashboardModulesView = new DashboardModulesView({
                collection: models.collections.modules
            });

            viewsTemp.add(dashboardModulesView);
        });
    }

    function control(module) {
        if (module) {
            navView.activateMenu("#/control/" + module);
        } else {
            navView.activateMenu("#/control");
        }

        require(["app/views/control/modules"], function(ModulesView) {
            var modulesView = new ModulesView({
                collection: models.collections.modules,
                type: module
            });

            viewsTemp.add(modulesView);
        });

    }

    function settings(time) {
        if (time) {
            navView.activateMenu("#/settings/" + time);
        } else {
            navView.activateMenu("#/settings");
        }

        require(["app/views/settings/settings", "app/views/settings/week"], function(SettingsView, WeekView) {
            if (time) {
                var weekView = new WeekView({
                    collection: models.collections.week
                });

                viewsTemp.add(weekView);
                return;
            }

            var settingsView = new SettingsView({
                collection: models.collections.settings
            });

            viewsTemp.add(settingsView);
        });
    }

    function data(what) {
        if (what) {
            navView.activateMenu("#/data/" + what);
        } else {
            navView.activateMenu("#/data");
        }

        if (!what || what === "photos") {
            require(["app/views/data/photos"], function(PhotosView) {
                var photosView = new PhotosView({
                    collection: models.collections.photos
                });

                viewsTemp.add(photosView);
            });
        }


        if (what === "visitors") {
            require(["app/views/data/visitors"], function(VisitorsView) {
                var visitorsView = new VisitorsView({
                    collection: models.collections.visitors
                });

                viewsTemp.add(visitorsView);
            });
        }

        if (what === "scores") {
            require(["app/views/data/statistics"], function(StatisticsView) {
                var statisticsView = new StatisticsView({
                    collection: models.collections.statistics
                });

                viewsTemp.add(statisticsView);
            });
        }

    }



    var Router = Backbone.Router.extend({
        routes: {
            "(/dashboard)": "dashboard",
            "control(/:query)": "control",
            "settings(/:query)": "settings",
            "data(/:query)": "data"
            /*,
            "search/:query": "search", // #search/kiwis
            "search/:query/p:page": "search" // #search/kiwis/p7*/
        },
        dashboard: viewsTemp.curryRoute(dashboard),
        control: viewsTemp.curryRoute(control),
        settings: viewsTemp.curryRoute(settings),
        data: viewsTemp.curryRoute(data)

    });

    return new Router();
});
