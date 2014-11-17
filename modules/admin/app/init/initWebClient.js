"use strict";
var _ = require("underscore");
var uuid = require("node-uuid");
var moment = require("moment");

function pickSetting(settings, id) {
    return _.find(settings, function(setting) {
        return setting.id === id;
    }).value;
}

module.exports = function(apps) {
    var shootingServer = apps.shootingServer;
    var brokerServer = apps.brokerServer;
    var redisClient = apps.redisClient;
    var webclient = apps.webclient;
    var databaseClient = apps.databaseClient;
    var stateServer = apps.stateServer;
    var facebookClient = apps.facebookClient;
    var debug = apps.debug;

    webclient.onReadModule(function(req, res, next) {
        req.model = [];
        redisClient.getAllModulesInfos(function(err, result) {
            if (err) {
                debug(err);
            } else if (result) {
                req.model.push(result);
            }
        }, function() {
            debug("Send %s modules to client", req.model.length);
            res.end(req.model);
        });
    });


    webclient.onPatchModule(function(req, res, next) {
        debug("Handle patch from webclient");
        var moduleReq = req.model;
        var changedAttrs = req.options.attrs;

        if ("on" in changedAttrs) {
            brokerServer[changedAttrs.on ? "turnAlertOn" : "turnAlertOff"](moduleReq.id);
            shootingServer[changedAttrs.on ? "turnAlertOn" : "turnAlertOff"](moduleReq.id);
        }

        if ("enabled" in changedAttrs) {
            brokerServer[changedAttrs.enabled ? "enableAlert" : "disableAlert"](moduleReq.id);
            shootingServer[changedAttrs.enabled ? "enableCamera" : "disableCamera"](moduleReq.id);
        }

        if ("reconnect" in changedAttrs) {
            if (moduleReq.id) {
                redisClient.setModuleInfos(moduleReq.id, {
                    "is_connected": false
                }, function(err, result) {
                    if (err) {
                        debug(err);
                        return;
                    }

                    result.id = moduleReq.id;
                    webclient.updateModule(result);
                });
            }
            brokerServer.reconnect(moduleReq.id);
        }

        if ("shoot" in changedAttrs) {
            shootingServer.shoot(moduleReq.id);
        }

        if ("cameraSettings" in changedAttrs) {
            shootingServer.updateCameraSettings(moduleReq.id, changedAttrs.cameraSettings);
        }

        if ("sysup" in changedAttrs) {
            shootingServer.svnUp(moduleReq.id, changedAttrs.username, changedAttrs.pwd);
        }

        next();
    });

    webclient.onReadSettings(function(req, res, next) {
        databaseClient.getAllSettings().then(function(data) {
            data.settings = _.map(data.settings, function(dat) {
                var returnedValue = dat.value;
                var parsedValue = parseInt(returnedValue, 10);

                if (dat.id === "isPaused") {
                    returnedValue = parsedValue === 0 ? false : true;
                } else {
                    returnedValue = parsedValue;
                }

                return {
                    id: dat.id,
                    value: returnedValue
                };
            });

            res.end(data);
            next();
        }, function(error) {
            debug(error);
            next();
        });
    });

    webclient.onUpdateSettings(function(req, res, next) {
        var model = req.model;
        debug("Update settings");

        if ("day_of_week" in model) {
            databaseClient.updateDay(model).then(function() {
                debug("Day saved to database");
                next();
            }, function(error) {
                debug("Could not save day to database");
                debug(error);
            });
        } else {
            databaseClient.updateSetting(model).then(function() {
                if (model.id === "minRealertDelay" || model.id === "maxRealertDelay") {
                    return databaseClient.getAllSettings();
                }
                debug("Setting saved to database");
                next();
            }).then(function(data) {
                if (data) {
                    redisClient.updateRandomDelay(parseInt(pickSetting(data.settings, "minRealertDelay"), 10), parseInt(pickSetting(data.settings, "maxRealertDelay"), 10));
                }
            }, function(error) {
                debug("Could not save setting to database");
                debug(error);
            });


        }
    });

    webclient.onPatchSettings(function(req, res, next) {
        var model = req.model;
        debug("Patch settings %s", model.id);
        if (model.id === "simulate") {
            if (model.simulate) {
                stateServer.transition("alert");
            } else {
                stateServer.transition("active");
                stateServer.checkState();
            }
        }

        if (model.id === "checkStatus") {
            stateServer.checkState();
        }

        next();
    });

    webclient.onReadPhotos(function(req, res, next) {
        console.log("Read photos", req.model);
        var fromDate,
            toDate;
        if (req.model) {
            fromDate = req.model.fromDate;
            toDate = req.model.toDate;
        }

        toDate = toDate || new Date();
        fromDate = fromDate || moment().subtract(7, "days").format();

        databaseClient.getPhotos(fromDate, toDate).then(function(photos) {
            res.end(photos);
            next();
        }, function(error) {
            debug(error);
            next();
        });
    });

    webclient.onReadData(function(req, res, next) {
        var options = req.options;

        if (!options.data) {
            next();
            return;
        }

        debug("Read data %s", options.data.collName);

        if (options.data.action) {
            if (options.data.action === "publish") {
                facebookClient.postPhotoOnPage(null, "https://hello.fb.byperiscope.com" + options.data.filename).then(function(facebookData) {
                    debug("Photo posted");
                    debug(facebookData);
                    if (options.data.helloId) {
                        databaseClient.updatePhotoWithPost(options.data.helloId, facebookData.id);
                    }
                    res.end(facebookData);
                }, function(error) {
                    debug("Error posting on Facebook / Updating database with posts");
                    debug(error);
                    res.end(error);
                });
            } else if (options.data.action === "publishOnWall") {

                databaseClient.getVisitor(options.data.visitorId).then(function(visitor) {
                    return facebookClient.greetingVisitor(visitor, "https://hello.fb.byperiscope.com" + options.data.filename).then(function(data) {
                        debug("Greeted  %s (%s) with post %s", visitor.name, visitor.id, data.id);
                        debug(data);
                        return databaseClient.updateVisitorWithPost(visitor.id, data.id);
                    });
                }).then(function(data) {
                    debug("Visitor updated");
                    debug(data);
                    res.end(data);
                }, function(error) {
                    debug(error);
                    res.end(error);
                });
            }else if (options.data.action === "deleteHello"){
                databaseClient.getVisitor(options.data.visitorId, true).then(function(visitor) {
                    visitor.HellosId = null;
                    visitor.save();
                }, function(error) {
                    debug(error);
                    res.end(error);
                });
            }
        } else {
            databaseClient.getData(options).then(function(data) {
                debug("Send %s %s", data.length, options.data.collName);
                debug(data);
                res.end(data);
            }, function(error) {
                debug(error);
                next();
            });
        }


    });
};

/*{ id: 7,
  filename: '/photos/249646d5-42cc-43df-bf95-5831a246d784.jpg',
  facebook_id: null,
  facebook_post_id: null,
  shootedAt: Thu Oct 02 2014 12:20:46 GMT+0200 (Paris, Madrid (heure d'été)),
  published: null,
  publishedAt: null,
  createdAt: Thu Oct 02 2014 12:20:46 GMT+0200 (Paris, Madrid (heure d'été)),
  updatedAt: Thu Oct 02 2014 12:20:46 GMT+0200 (Paris, Madrid (heure d'été)),
  HellosId: null },*/