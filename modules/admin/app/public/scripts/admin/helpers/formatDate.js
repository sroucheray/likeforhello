define(["hbs/handlebars", "moment"], function(Handlebars, moment) {
    "use strict";

    function formatDate(context, options) {
        var date = parseInt(context, 10);
        if (context !== "" + date) {
            date = context;
        }
        return moment(date).format(options.hash.format || "[le] Do MMMM YYYY [à] HH:mm:ss");
    }
    Handlebars.registerHelper("formatDate", formatDate);
    return formatDate;
});
