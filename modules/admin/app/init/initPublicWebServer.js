/*eslint camelcase:0 */
"use strict";
var _ = require("underscore");

module.exports = function(apps) {
    var webserver = apps.webserver;
    var databaseClient = apps.databaseClient;
    var publicApp = webserver.getPublicApp();
    var facebookClient = apps.facebookClient;
    var redisClient = apps.redisClient;
    var debug = apps.debug;


    function greetVisitor(visitor) {
        facebookClient.greetingVisitor(visitor, "https://hello.fb.byperiscope.com/photos/99543d6f-2b30-4abb-be1b-d670f0df51f8.jpg").then(function(data) {
            debug("Greeted  %s (%s) with post %s", visitor.name, visitor.id, data.id);
            debug(data);
            return databaseClient.updateVisitorWithPost(visitor.id, data.id);
        }).fail(function(error) {
            debug("Fail to greet %s (%s)", visitor.name, visitor.id);
            debug(error);
        });
    }


    publicApp.get("/stats/get", function(req, res) {
        var result = {};
        databaseClient.getLastPhotos().then(function(photos) {
            debug("Last photos getted");
            result.lastPhotos = photos;

            return databaseClient.getOperationStats();
        }).then(function(stats) {
            debug("Operations stats getted");
            result.stats = stats;

            redisClient.getPhotoOfTheDay(function(err, filename) {
                debug("Photo of the day getted");
                if (err) {
                    result.error = err;
                    res.end(result);
                    return;
                }
                result.ofTheDay = filename;
                res.end(result);
            });
        }, function(err) {
            result.error = err;
            res.end(result);
        });

    });

    publicApp.post("/user/update", function(req, res) {
        //var isTest = req.param("test");

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
            req.body.expanded_access_token = res.access_token;
        }).fail(function(error) {
            debug("Fail to expand access_token %s", req.body.access_token);
            debug(error);
        }).fin(function() {
            req.body.HellosId = null;
            databaseClient.createVisitor(req.body, function(user, created) {
                if (/@tfbnw.net$/.test(user.email)) {
                    debug("This is a facebook user : %s", user.email);
                    greetVisitor(user);
                } else {
                    debug("This is not a facebook user : %s", user.email);
                }

                if (created) {
                    debug("New visitor : %s (%s)", user.name, user.id);


                    res.status(200).end("");

                    return;
                }

                debug("Updated visitor : %s (%s)", user.name, user.id);
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