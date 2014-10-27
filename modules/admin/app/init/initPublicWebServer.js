/*eslint camelcase:0 */
"use strict";
var _ = require("underscore");

module.exports = function(apps) {
    var webserver = apps.webserver;
    var databaseClient = apps.databaseClient;
    var publicApp = webserver.getPublicApp();
    var facebookClient = apps.facebookClient;
    var debug = apps.debug;

    publicApp.post("/user/update", function(req, res) {
        var isTest = req.param("test");

        if (!req.xhr) {
            res.status(400).end("Not right buddy");
            return;
        }

        if (!req.body || !req.body.id) {
            res.status(400).end("Not enough data buddy");
            return;
        }

        req.body.granted_publish_actions = false;

        _.each(req.body.auth, function(auth) {
            if (auth.permission === "publish_actions") {
                req.body.granted_publish_actions = true;
            }
        });


        facebookClient.expandToken(req.body.access_token).then(function(res) {
            req.body.expanded_access_token  = res.access_token;
        }).fail(function(error) {
            debug("Fail to expand access_token %s", req.body.access_token);
            debug(error);
        }).fin(function() {
            databaseClient.createVisitor(req.body, function(user, created) {
                if (created || isTest) {
                    debug("New visitor : %s (%s)", user.name, user.id);

                    //TODO: He is not a new visitor we should say thanks  to him
                    res.status(200).end("");

                    return;
                }

                debug("Updated visitor : %s (%s)", user.name, user.id);
                //TODO: He is not a new visitor we should say it to him
                res.status(200).end("");
            }, function(error) {
                debug("Error creating/updating visitor");
                debug(req.body);
                debug(error);
                res.status(400).end("Error buddy");
            });
        });

    });
};