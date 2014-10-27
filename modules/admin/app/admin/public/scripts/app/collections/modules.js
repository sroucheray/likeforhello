/*eslint-env amd */
define(["app/models/module", "backbone", "backbone.io"], function(models, Backbone) {
    "use strict";
    var Modules = Backbone.Collection.extend({
        backend: "moduleBackend",
        model: function(attrs, options) {
            if (attrs.type === "alert") {
                return new models.AlertModule(attrs, options);
            }else if(attrs.type === "cam"){
                return new models.CamModule(attrs, options);
            }else if(attrs.type === "button"){
                return new models.ButtonModule(attrs, options);
            }

            return new models.Module(attrs, options);
        },
        initialize: function() {
            var self = this;

            this.bind("backend:create", function(data) {
                self.add(data, {
                    merge: true
                });
            });

            this.bind("backend:update", function(data) {
                var model = self.get(data.id).set(data);
                if (model) {
                    model.set(data);
                } else {
                    self.add(data, {
                        merge: true
                    });
                }
            });

            this.bind("backend:delete", function(data) {
                self.remove(data.id);
            });

            this.bind("sync", function(col, data) {
                _.each(data, function(module) {
                    self.add(module, {
                        merge: true
                    });
                });
            });
        }
    });

    return Modules;
});