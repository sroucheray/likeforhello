define(["hbs/handlebars"], function(Handlebars) {
    "use strict";
    var weekdays = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi"
    ];

    function dayOfWeek(num) {
        if (num >= 0 && num < 7) {
            return weekdays[num];
        }

        return "N/A";
    }

    Handlebars.registerHelper("dayOfWeek", dayOfWeek);
    return dayOfWeek;
});