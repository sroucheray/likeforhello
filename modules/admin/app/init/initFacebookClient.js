"use strict";
module.exports = function(apps) {
    var webserver = apps.webserver;
    var facebookClient = apps.facebookClient;

    webserver.getPublicApp().all("/redirect_uri", facebookClient.redirectMiddleware);

    webserver.getPublicApp().all("/redirect_uri", facebookClient.redirectMiddleware);

    webserver.getPublicApp().publicApp.get("/attente", function(req, res) {
        res.render("public/attente");
    });
};
