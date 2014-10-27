/*eslint-env amd*/
/*eslint camelcase:0*/
define(["underscore", "backbone", "jquery", "app/models", "hbs!views/partials/alert"], function(_, Backbone, $, models, alertTemplate) {
    "use strict";
    var BodyView = Backbone.View.extend({
        el: "body",
        collection: models.collections.states,
        views: [],
        updateState: function() {
            var activeState = this.collection.get("active");
            var alertState = this.collection.get("state");
            if (activeState) {
                this.$content.find("#alert").remove();
                this.$el.removeClass("bg-danger");

                if (!activeState.get("active")) {
                    this.$el.addClass("bg-danger");
                    this.$content.prepend(alertTemplate({
                        name: "L'opération n'est pas en cours",
                        message: _.last(activeState.get("message"))
                    }));
                }
            }

            if(alertState){
                $(".state-alert").find("span").toggleClass("text-danger", alertState.get("alert"));
            }
        },
        initialize: function() {
            this.$content = $("#content");
            this.listenTo(this.collection, "all", this.updateState.bind(this));

            this.collection.fetch();
            this.render();
            //this.updateState();
        },
        add: function(view) {
            this.$content.append(view.$el.get(0));
        },
        render: function() {
            return this;
        }

    });

    return new BodyView();
});