"use strict";
var _ = require("underscore");
var uuid = require("node-uuid");
var path = require("path");
var fs = require("fs");

module.exports = function(apps) {
    var shootingServer = apps.shootingServer;
    var redisClient = apps.redisClient;
    var webclient = apps.webclient;
    var debug = apps.debug;
    var config = apps.config;
    var databaseClient = apps.databaseClient;

    shootingServer.onClientConnected(function(data) {
        debug("Camera connected %s", data.clientId);
        var lastAliveTime = new Date().getTime();

        redisClient.getModuleInfos(data.clientId, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            var settings = _.pick(result, _.keys(config.camera.defaults));

            shootingServer.updateCameraSettings(data.clientId, settings);
        });

        redisClient.setModuleInfos(data.clientId, {
            "last_alive_time": lastAliveTime,
            "connected_at": lastAliveTime,
            "is_connected": true,
            "shooting": data.shooting,
            "enabled": data.enabled
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            result.id = data.clientId;

            webclient.updateModule(result);
        });
    });

    shootingServer.onClientDisconnected(function(data) {
        debug("Camera disconnected %s", data.clientId);
        var lastAliveTime = new Date().getTime();

        redisClient.setModuleInfos(data.clientId, {
            "disconnected_at": lastAliveTime,
            "last_alive_time": lastAliveTime,
            "is_connected": false
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            result.id = data.clientId;
            webclient.updateModule(result);
        });
    });

    shootingServer.onShooting(function(data) {
        debug("Camera shooting %s", data.clientId);
        var lastAliveTime = new Date().getTime();

        redisClient.setModuleInfos(data.clientId, {
            "disconnected_at": lastAliveTime,
            "last_alive_time": lastAliveTime,
            "is_connected": true,
            "shooting": true
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            result.id = data.clientId;
            webclient.updateModule(result);
        });
    });

    shootingServer.onShooted(function(data) {
        debug("Camera shooted %s", data.clientId);
        var self = this;
        var lastAliveTime = new Date().getTime();
        var filename = uuid.v4() + ".jpg";
        var fullpath = path.join(process.cwd(), config.tmp, filename);


        if (data.imageBuffer) {
            debug("Will create photo to file %s", filename);
            fs.writeFile(fullpath, data.imageBuffer, function(err) {
                if (err) {
                    debug("Could not create photo to file %s", filename);
                    debug(err);
                }

                debug("Photo dumped to file");

                redisClient.setModuleInfos(data.clientId, {
                    "disconnected_at": lastAliveTime,
                    "last_alive_time": lastAliveTime,
                    "last_shoot_time": lastAliveTime,
                    "last_shoot_image": "/photos/" + filename,
                    "is_connected": true,
                    "shooting": false
                }, function(err, result) {
                    if (err) {
                        debug(err);
                        return;
                    }

                    result.id = data.clientId;
                    webclient.updateModule(result);
                });

                self.emit("photo:created", {
                    "filename": "/photos/" + filename,
                    "helloId": data.helloId,
                    "shootedAt": lastAliveTime
                });
            });

            return;
        }

        debug("No data received, can't create file %s", filename);

        self.emit("photo:failed", {
            "helloId": data.helloId
        });

    });

    shootingServer.onSettingsUpdated(function(data) {
        debug("Camera settings updated %s", data.clientId);
        redisClient.setModuleInfos(data.clientId, data.settings, function(err, result) {
            if (err) {
                debug(err);
                return;
            }


            result.id = data.clientId;
            webclient.updateModule(result);
        });
    });

    shootingServer.onIPUpdated(function(data) {
        debug("Camera IP updated %s", data.clientId);
        var lastAliveTime = new Date().getTime();

        redisClient.setModuleInfos(data.clientId, {
            "last_alive_time": lastAliveTime,
            "ip": data.ip,
            "is_connected": true
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            result.id = data.clientId;

            webclient.updateModule(result);
        });

    });

    shootingServer.onCameraEnabled(function(data) {
        debug("Camera enabled %s : %s", data.clientId, data.enabled);
        redisClient.setModuleInfos(data.clientId, {
            enabled: data.enabled
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }


            result.id = data.clientId;
            webclient.updateModule(result);
        });
    });
};