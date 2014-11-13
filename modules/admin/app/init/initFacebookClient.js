"use strict";
module.exports = function(apps) {
    var webserver = apps.webserver;
    var facebookClient = apps.facebookClient;
    var stateServer = apps.stateServer;
    var moment = require("moment");

    webserver.getPublicApp().all("/redirect_uri", facebookClient.redirectMiddleware);

    webserver.getPublicApp().publicApp.get("/attente", function(req, res) {
        var isActive = stateServer.isActive();

        if (isActive) {
            res.render("public/attente");
        } else {
            var day = moment().day();
            if (day === 0 || day === 6) {
                res.render("public/fermeture-weekend");
            } else {
                res.render("public/fermeture");
            }
        }
    });
};
