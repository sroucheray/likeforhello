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


    function renderHome(req, res) {
        var id = req.query.id;


        console.log("params", req.params);
        console.log("body", req.body);
        console.log("query", req.query.app_data);

        if (!id && req.body.signed_request) {
            var signed_request = req.body.signed_request.split(".");
            if (signed_request.length > 1) {
                try {
                    signed_request = JSON.parse(new Buffer(signed_request[1], "base64").toString());
                    debug(signed_request);
                    id = signed_request.app_data;
                } catch (e) {
                    debug(e);
                }
            }
        }

        if (id) {
            databaseClient.getFullVisitor(id).then(function(visitor) {
                    if (visitor) {
                        debug("Showing home with user id : %s", visitor[0].id);
                        res.render("public/accueil-desktop-photo", visitor[0]);
                    } else {
                        debug("Error showing home with user id : %s", id);
                        res.render("public/accueil-desktop");
                    }
                },
                function(err) {
                    debug("Error showing home with user id : %s", id);
                    debug(err);
                    res.render("public/accueil-desktop");
                });
        } else {
            res.render("public/accueil-desktop");
        }
    }


    publicApp.post("/", renderHome);
    publicApp.get("/", renderHome);

    publicApp.get("/mobile", function(req, res) {
        var id = req.query.id;


        console.log("params", req.params);
        console.log("body", req.body);
        console.log("query", req.query.app_data);

        if (id) {
            databaseClient.getFullVisitor(id).then(function(visitor) {
                    if (visitor) {
                        debug("Showing home with user id : %s", visitor[0].id);
                        res.render("public/accueil-mobile-photo", visitor[0]);
                    } else {
                        debug("Error showing home with user id : %s", id);
                        res.render("public/accueil-mobile");
                    }
                },
                function(err) {
                    debug("Error showing home with user id : %s", id);
                    debug(err);
                    res.render("public/accueil-mobile");
                });
        } else {
            res.render("public/accueil-mobile");
        }
    });


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
                    res.json(result);
                    return;
                }
                result.ofTheDay = filename;
                res.json(result);
            });
        }, function(err) {
            result.error = err;
            res.json(result);
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