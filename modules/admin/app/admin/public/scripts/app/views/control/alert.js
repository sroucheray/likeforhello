/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!views/admin/partials/control/alert", "app/models/module", "underscore", "backbone", "app/views/utils"], function(alertTemplate, moduleModel, _, Backbone, utils) {
    "use strict";
    var ModuleView = utils.ParentView.extend({
        tagName: "div",
        events: {
            "click .module-turn-on": "turnOn",
            "click .module-turn-off": "turnOff",
            "click .module-enable": "enable",
            "click .module-disable": "disable",
            "click .module-reconnect": "reconnect"
        },
        template: alertTemplate,
        render: function() {
            var model = this.model.toJSON();

            this.$el.addClass("col-sm-3").html(this.template(model));

            return this;
        },
        turnOn: function(event) {
            event.preventDefault();
            this.model.turnOn();
        },
        turnOff: function(event) {
            event.preventDefault();
            this.model.turnOff();
        },
        enable: function(event) {
            event.preventDefault();
            this.model.enable();
        },
        disable: function(event) {
            event.preventDefault();
            this.model.disable();
        },
        reconnect: function(event) {
            event.preventDefault();
            this.model.reconnect();
        }
    });

    return ModuleView;
});