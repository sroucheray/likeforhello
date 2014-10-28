define(["backbone", "underscore"], function(Backbone, _) {
    "use strict";
    var State = Backbone.Model.extend({
        backend: "stateBackend",
        initialize: function() {
            /*this.on('change', function() {
                console.log("change in State on", this);
            })
            this.on('add', function() {
                console.log("add in State on", this);
            })
            this.on('all', function() {
                console.log("ALL %s in State on", arguments[0], this.id);
            })*/
        }
    });



    return {
        State: State
    };
});