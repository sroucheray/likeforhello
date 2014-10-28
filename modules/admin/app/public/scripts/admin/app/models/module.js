define(["backbone", "underscore"], function(Backbone, _) {
    "use strict";
    var Module = Backbone.Model.extend({
        initialize: function() {
            /*this.on('all', function() {
                console.log("ALL in module on", arguments);
            });*/
        },
        enable: function() {
            this.save({
                enabled: true
            }, {
                patch: true
            });
        },
        disable: function() {
            this.save({
                enabled: false
            }, {
                patch: true
            });
        },
        reconnect: function() {
            this.save({
                reconnect: new Date().getTime()
            }, {
                patch: true
            });
        },
        enabled: function() {
            return this.get("enabled");
        }
    });


    var AlertModule = Module.extend({
        turnOn: function() {
            this.save({
                on: true
            }, {
                patch: true
            });
        },
        turnOff: function() {
            this.save({
                on: false
            }, {
                patch: true
            });
        },
        isOn: function() {
            return this.get("on");
        }
    });


    var CamModule = Module.extend({
        turnOn: function() {
            this.save({
                on: true
            }, {
                patch: true
            });
        },
        turnOff: function() {
            this.save({
                on: false
            }, {
                patch: true
            });
        },
        shoot: function() {
            this.save({
                shoot: new Date().getTime()
            }, {
                patch: true
            });
        },
        sysup: function(username, pwd) {
            this.save({
                sysup: new Date().getTime(),
                username: username,
                pwd: pwd
            }, {
                patch: true
            });
        },
        saveCameraSettings: function(key, val) {
            var data = {
                cameraSettings: {}
            };
            data.cameraSettings[key] = val;
            this.save(data, {
                patch: true,
                cameraSettings: true
            });
        }
    });


    var ButtonModule = Module.extend({});

    return {
        Module: Module,
        ButtonModule: ButtonModule,
        AlertModule: AlertModule,
        CamModule: CamModule
    };
});