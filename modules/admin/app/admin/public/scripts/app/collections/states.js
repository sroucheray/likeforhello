/*eslint-env amd */
define(["app/models/state", "underscore", "backbone", "backbone.io"], function(model, _, Backbone) {
    "use strict";
    var States = Backbone.Collection.extend({
        backend: "stateBackend",
        model: model.State,
        initialize: function() {
            var self = this;

            function addOrUpdate(data) {
                var state = self.get(data.id);
                if (state) {
                    //console.log("Update state with data", data)
                    state.set(data);
                } else {
                    //console.log("Set state with data", data)
                    self.add(data, {
                        merge: true
                    });
                }
            }

            this.bind("backend:create", function(data) {
                //console.log("create state", data)
                addOrUpdate(data);
            });

            this.bind("backend:update", function(data) {
                //console.log("update state", data)
                addOrUpdate(data);
            });

            this.bind("backend:delete", function(data) {
                self.remove(data.id);
            });

            this.bind("sync", function(col, data) {
                //console.log('sync', data)
                addOrUpdate(data);
                /*_.each(data.settings, function(setting) {
                    console.log("setting", setting);
                    self.add(setting, {
                        merge: true
                    });
                });*/
            });

        }
    });

    return States;
});