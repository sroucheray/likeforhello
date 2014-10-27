define(["hbs/handlebars"], function(Handlebars) {
    "use strict";
    function ifDiff(a, b, options) {
        if (a !== b){
            return options.fn(this);
        } else{
            return options.inverse(this);
        }
    }

    Handlebars.registerHelper("ifDiff", ifDiff);
    return ifDiff;
});