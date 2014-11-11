"use strict";
module.exports = function(apps) {
    var webserver = apps.webserver;
    var facebookClient = apps.facebookClient;

    webserver.getPublicApp().all("/redirect_uri", facebookClient.redirectMiddleware);
};
