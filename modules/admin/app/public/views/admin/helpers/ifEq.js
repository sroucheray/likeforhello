define(["hbs/handlebars"], function(Handlebars) {
    "use strict";
    function ifEq(a, b, options) {
        if (a === b){
            return options.fn(this);
        } else{
            return options.inverse(this);
        }
    }

    Handlebars.registerHelper("ifEq", ifEq);
    return ifEq;
});