/*eslint-env amd*/
/*eslint camelcase:0*/
define(["underscore", "backbone", "jquery"], function(_, Backbone, $) {
    "use strict";
    var NavView = Backbone.View.extend({
        el: ".navbar",
        events: {
            /*"click .navbar > ul > li a": "selectMenuLevel1"*/
        },
        initialize: function() {
            this.render();
        },
        render: function() {
            return this;
        },
        deactiveAllMenu:function(){
            this.$el.find("li.active").removeClass("active");
        },
        selectMenuLevel1 : function(event){
            event.preventDefault();
            this.deactiveAllMenuLevel();
            $(event.currentTarget).parent("li").addClass("active");
        },
        activateMenu: function(href){
            this.deactiveAllMenu();
            this.$el.find('a[href="' + href + '"]').parentsUntil(".navbar", "li").addClass("active");
        }

    });

    return new NavView();
});