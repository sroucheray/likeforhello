require([
    "moment",
    "backbone",
    "app/router",
    "jquery",
    "moment.fr",
    "backbone.io",
    "bootstrap",
    "app/views/control/modules",
    "app/views/dashboards/modules",
    "app/views/settings/settings",
    "app/views/settings/week"
], function(moment, Backbone) {
    "use strict";
    moment.locale("fr");
    Backbone.history.start();
});