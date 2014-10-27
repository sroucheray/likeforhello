define(["backbone"], function(Backbone) {
    "use strict";
    var ParentView = Backbone.View.extend({
        childViews: null,
        initialize:function(){
            this.childViews = [];
        },
        addChildView: function(childView) {
            this.childViews.push(childView);
        },
        close: function() {
            this.remove();
            this.unbind();
            // handle other unbinding needs, here
            for (var i = this.childViews.length - 1; i >= 0; i--) {
                if (this.childViews[i].close) {
                    this.childViews[i].close();
                }
            }
            this.childViews = [];
        }

    });

    return {
        ParentView: ParentView
    };
});