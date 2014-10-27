"use strict";
module.exports = function(apps) {
    var webserver = apps.webserver;
    var facebookClient = apps.facebookClient;
    var debug = apps.debug;

    webserver.getPublicApp().get("/redirect_uri", facebookClient.redirectMiddleware);
};