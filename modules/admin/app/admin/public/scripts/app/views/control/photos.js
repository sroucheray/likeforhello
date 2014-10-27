/*eslint-env amd*/
/*eslint camelcase:0 no-underscore-dangle:0*/
define(["hbs!views/partials/control/alert", "hbs!views/partials/control/button", "hbs!views/partials/control/camera", "app/models/module", "underscore", "backbone", "app/views/utils", "jquery"], function(alertTemplate, buttonTemplate, cameraTemplate, moduleModel, _, Backbone, utils, $) {
    "use strict";
    var ModuleView = utils.ParentView.extend({
        tagName: "div",
        events: {
            "click .module-turn-on": "turnOn",
            "click .module-turn-off": "turnOff",
            "click .module-shoot": "shoot",
            "click .module-enable": "enable",
            "click .module-disable": "disable",
            "click .module-reconnect": "reconnect",
            "submit .sysup": "sysup"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            var that = this;
            this.listenTo(this.model, "change", function(model, changed) {
                if ("cameraSettings" in changed) {
                    return;
                }
                that.render();
            });
        },
        setupCameraControls: function() {
            var that = this;

            if (this.model.get("shooting")) {
                this.$el.find(".module-shoot").button("loading");
            }

            this.$el.find(".settings input, .settings select").each(function() {
                var $input = $(this),
                    $output = $input.siblings().find("output"),
                    id = $input.attr("id"),
                    type = $input.attr("type"),
                    val,
                    commitTimeout;

                id = id.split("-")[0];
                val = that.model.get(id);

                function commitChanges() {
                    var currentVal = type === "checkbox" ? $input.is(":checked") : $input.val();
                    that.model.set(id, currentVal, {
                        silent: true
                    });
                    that.model.saveCameraSettings(id, currentVal);
                }

                function setOutput() {
                    if ($output.length) {
                        $output.text($input.val());

                        $input.on("change input", function() {
                            $output.text($input.val());
                        });

                        if (type === "checkbox") {
                            $input.on("click", function() {
                                $output.text($input.val());
                            });
                        }
                    }
                }

                $input.on("change input", function() {
                    clearTimeout(commitTimeout);
                    commitTimeout = setTimeout(commitChanges, 300);
                });

                if (type === "checkbox") {
                    $input.on("click", function() {
                        clearTimeout(commitTimeout);
                        commitTimeout = setTimeout(commitChanges, 300);
                    });
                }

                if (type === "checkbox") {
                    $input.prop("checked", val);
                    return;
                }

                $input.val(val);
                setOutput();
            });

            this.$el.find(".pwd").val("");
        },
        template: cameraTemplate,
        render: function() {
            var model = this.model.toJSON();

            this.$el.addClass("col-sm-4").html(this.template(model));
            this.setupCameraControls();

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
        shoot: function(event) {
            event.preventDefault();
            this.model.shoot();
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
        },
        sysup: function(event) {
            event.preventDefault();
            var $username = this.$el.find(".username");
            var $pwd = this.$el.find(".pwd");

            this.model.sysup($username.val(), $pwd.val());

            $pwd.val("");
        }
    });

    return ModuleView;
});