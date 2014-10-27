define(["backbone", "underscore"], function(Backbone, _) {
    "use strict";
    var Day = Backbone.Model.extend({
        /*initialize: function() {
            this.on('change', function() {
                console.log("change in day on", this);
            })
            this.on('add', function() {
                console.log("add in day on", this);
            })
            this.on('all', function() {
                console.log("ALL %s in day on", arguments[0], this.id);
            })
        }*/
    });



    return {
        Day: Day
    };
});