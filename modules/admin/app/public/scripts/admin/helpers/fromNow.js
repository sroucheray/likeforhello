define(["hbs/handlebars", "moment"], function(Handlebars, moment) {
    "use strict";
    function fromNow(context, options) {
        var date = parseInt(context, 10);

        if(context === ("" + date)){
            return moment(date).fromNow();
        }

        return moment(context).fromNow();
    }
    Handlebars.registerHelper("fromNow", fromNow);
    return fromNow;
});