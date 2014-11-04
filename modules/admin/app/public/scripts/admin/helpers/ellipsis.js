define(["hbs/handlebars"], function(Handlebars) {
    "use strict";
    function ellipsis(size, text) {
        return text.slice(0, size);
    }

    Handlebars.registerHelper("ellipsis", ellipsis);
    return ellipsis;
});
