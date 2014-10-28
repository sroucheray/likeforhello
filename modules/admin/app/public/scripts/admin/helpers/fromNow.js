define(["hbs/handlebars", "moment"], function(Handlebars, moment) {
    "use strict";
    function fromNow(context, options) {
        if(!options){
            return moment(parseInt(context, 10)).fromNow();
        }

        return moment(context).fromNow();
    }
    Handlebars.registerHelper("fromNow", fromNow);
    return fromNow;
});