/*eslint-env amd */

define(["app/models/setting", "underscore", "backbone", "backbone.io"], function(model, _, Backbone) {
    "use strict";
    var Modules = Backbone.Collection.extend({
        backend: "settingsBackend",
        model: model.Setting,
        initialize: function() {
            var self = this;
            /*this.bind("change", function(data) {
                console.log("change", arguments)

                self.add(data, {
                    merge: true
                });
            });
*/

            /*this.bind("change", function(data) {
                console.log("update settings")
                var setting = self.get(data.id).set(data);
                if (setting) {
                    setting.set(data);
                } else {
                    self.add(data, {
                        merge: true
                    });
                }
            });*/

            /*            this.bind("backend:delete", function(data) {
                self.remove(data.id);
            });*/

            this.bind("sync", function(col, data) {
                _.each(data.settings, function(setting) {
                    self.add(setting, {
                        merge: true
                    });
                });
            });
        },
        simulateAlert: function() {
            var model = this.add({
                id: "simulate"
            }, {
                merge: true
            });

            model.save({
                simulate: new Date().getTime()
            }, {
                patch: true
            });
        },
        stopSimulateAlert: function() {
            var model = this.add({
                id: "simulate"
            }, {
                merge: true
            });

            model.save({
                simulate: false
            }, {
                patch: true
            });
        },
        checkStatus: function() {
            var model = this.add({
                id: "checkStatus"
            }, {
                merge: true
            });

            model.save({
                date: new Date().getTime()
            }, {
                patch: true
            });
        }
    });
    return Modules;
});