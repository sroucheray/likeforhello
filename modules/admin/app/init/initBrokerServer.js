"use strict";
module.exports = function(apps) {
    var shootingServer = apps.shootingServer;
    var brokerServer = apps.brokerServer;
    var databaseClient = apps.databaseClient;
    var redisClient = apps.redisClient;
    var webclient = apps.webclient;
    var stateServer = apps.stateServer;
    var debug = apps.debug;


    brokerServer.onDisconnected(function(data) {
        redisClient.getAllModulesInfos(function(err, result) {
            if (err) {
                debug(err);
                return;
            }
            debug("Should disconnect")

            if (result.broker === data.broker_ip) {
                result.is_connected = false;
                redisClient.setModuleInfos(data.id, result, function() {
                    debug("Signal disconnection of %s module", data.id);
                })
            }
        });
    });

    brokerServer.onClientConnected(function(data) {
        debug("MQTT client connected %s", data.clientId);
        var lastAliveTime = new Date().getTime();

        redisClient.setModuleInfos(data.clientId, {
            "broker": data.broker_ip,
            "last_alive_time": lastAliveTime,
            "connected_at": lastAliveTime,
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

    brokerServer.onClientDisconnected(function(data) {
        debug("MQTT client disconnected %s", data.clientId);
        var lastAliveTime = new Date().getTime();

        redisClient.setModuleInfos(data.clientId, {
            "broker": data.broker_ip,
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

    brokerServer.onButtonPushed(function(data) {
        debug("Button %s pushed on %s", data.buttonId, data.clientId);
        var lastAliveTime = new Date().getTime();

        redisClient.setModuleInfos(data.clientId, {
            "last_pushed_time": lastAliveTime,
            "last_pushed_button_id": data.buttonId,
            "last_alive_time": lastAliveTime
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            result.id = data.clientId;
            webclient.updateModule(result);
        });

        if (stateServer.state === "alert") {
            debug("Button pushed while alert state, this is a win for team %s", data.buttonId);
            var cameraId;
            if (data.clientId === "button_ground") {
                cameraId = "cam_ground";
            } else if (data.clientId === "button_1stfloor") {
                cameraId = "cam_1stfloor";

            } else if (data.clientId === "button_2ndfloor") {
                cameraId = "cam_2ndfloor";
            }

            data.camera = cameraId;

            databaseClient.sayHello(data).then(function(hello) {
                stateServer.transition("active");
                stateServer.checkState();
                debug("Hello created");
                var helloId = hello.id;
                shootingServer.shoot(cameraId, helloId);
            });

        }

    });

    brokerServer.onIPUpdate(function(data) {
        debug("MQTT client %s IP status %s", data.clientId, data.ip);
        var lastAliveTime = new Date().getTime();

        redisClient.setModuleInfos(data.clientId, {
            "ip": data.ip,
            "last_alive_time": lastAliveTime
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            result.id = data.clientId;
            webclient.updateModule(result);
        });
    });

    brokerServer.onEnabledUpdate(function(data) {
        debug("MQTT client %s is %s", data.clientId, data.enabled ? "enabled" : "disabled");
        var lastAliveTime = new Date().getTime();
        redisClient.setModuleInfos(data.clientId, {
            "enabled": data.enabled,
            "last_alive_time": lastAliveTime
        }, function(err, result) {
            if (err) {
                debug(err);
                return;
            }

            result.id = data.clientId;
            webclient.updateModule(result);
        });
    });

    brokerServer.onTurnedOnUpdate(function(data) {
        debug("MQTT client %s is turned %s", data.clientId, data.on ? "on" : "off");
        var lastAliveTime = new Date().getTime();
        redisClient.setModuleInfos(data.clientId, {
            "last_alive_time": lastAliveTime,
            "on": data.on
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