define(["backbone", "underscore"], function(Backbone, _) {
    "use strict";
    var Setting = Backbone.Model.extend({
        /*initialize: function() {
            this.on('change', function() {
                console.log("change in setting on", this);
            })
            this.on('add', function() {
                console.log("add in setting on", this);
            })
            this.on('all', function() {
                console.log("ALL %s in setting on", arguments[0], this.id);
            })
        }*/
    });



    return {
        Setting: Setting
    };
});