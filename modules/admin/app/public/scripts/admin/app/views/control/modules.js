/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!/views/admin/partials/control/modules",
    "app/views/control/photos",
    "app/views/control/alert",
    "app/views/control/button",
    "app/models/module",
    "underscore",
    "backbone",
    "app/views/utils"
], function(template, PhotosControlView, AlertControlView, ButtonControlView, ModuleModels, _, Backbone, utils) {
    "use strict";
    var ModulesView = utils.ParentView.extend({
        tagName: "div",
        initialize: function(data) {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            this.type = data.type;
            this.listenToOnce(this.collection, "sync", this.render);
            this.listenTo(this.collection, "change", this.render);

            this.collection.fetch();
        },
        template: template,
        render: function() {
            var self = this;
            var filtered = this.collection.filter(function(model) {
                return model.get("type") === self.type && !model.get("spared");
            });

            var counts = _.countBy(filtered, function(model) {
                return model.get("type");
            });

            counts.hasModule = !! filtered.length;
            counts.numModules = filtered.length;
            counts.connected = _.filter(filtered, function(model) {
                return model.get("is_connected");
            }).length;
            counts.disconnected = counts.numModules - counts.connected;

            counts.type = this.type;
            this.$el.html(this.template(counts));

            _.each(filtered, function(module) {
                var moduleView;

                if (module instanceof ModuleModels.CamModule) {
                    moduleView = new PhotosControlView({
                        model: module
                    });
                }

                if (module instanceof ModuleModels.AlertModule) {
                    moduleView = new AlertControlView({
                        model: module
                    });
                }

                if (module instanceof ModuleModels.ButtonModule) {
                    moduleView = new ButtonControlView({
                        model: module
                    });
                }

                self.addChildView(moduleView);

                this.$el.find(".modules").append(moduleView.render().$el);

            }, this);
            return this;
        }

    });

    return ModulesView;
});