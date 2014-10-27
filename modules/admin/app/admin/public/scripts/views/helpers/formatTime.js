define(["hbs/handlebars", "moment"], function(Handlebars, moment) {
    "use strict";
    function formatTime(context, options) {
        return moment.duration(parseInt(context, 10), "milliseconds").format(options.hash.format || "m [minutes] s [secondes]");
    }
    Handlebars.registerHelper("formatTime", formatTime);
    return formatTime;
});