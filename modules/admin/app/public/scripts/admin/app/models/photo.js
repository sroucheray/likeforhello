define(["backbone", "underscore"], function(Backbone, _) {
    "use strict";
    var Photo = Backbone.Model.extend({
        initialize: function() {
            /*
            this.on('all', function() {
                console.log("ALL %s in State on", arguments[0], this.id);
            })*/
        }
    });

    return {
        Photo: Photo
    };
});