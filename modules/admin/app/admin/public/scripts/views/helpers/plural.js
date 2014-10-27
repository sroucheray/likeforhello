define(["hbs/handlebars"], function(Handlebars) {
    "use strict";
    function plural(num, text) {
        if(num === 0 || num === 1){
            return text;
        }

        if(text === "est"){
            return "sont";
        }

        return text + "s";
    }

    Handlebars.registerHelper("plural", plural);
    return plural;
});