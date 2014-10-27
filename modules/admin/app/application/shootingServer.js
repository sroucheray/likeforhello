"use strict";
var socketIO = require("socket.io");
var config = require("../../../shooting/config.json");
var _ = require("underscore");
var debug = require("debug")("admin:shooting-server");
var EventEmitter = require("events").EventEmitter;

function ShootingServer(socketServer) {
    this.socketServer = socketServer;
}
require("util").inherits(ShootingServer, EventEmitter);

ShootingServer.prototype.start = function() {
    debug("Shooting server started");
    var that = this;
    this.io = this.socketServer.of("/shooting");

    this.io.on("connection", function(socket) {
        debug("New shooting client connected : %s", socket.handshake.address);
        var clientId;
        // There seem no to be an easy way to listen (.on) to all sockets
        // at the same time
        // Listen to all topics on all connected client
        _.each(config.topics.status, function(topic) {
            socket.on(topic, function(data) {
                clientId = clientId || data.clientId;
                if(data.ip){
                    debug("Shooting client %s connected IP is %s", clientId, data.ip)
                }
                //data.ip = socket.handshake.address;
                that.statusUpdated(topic, data);
            });
        });

        socket.on(config.topics.camera.shooted, function(data) {
            //data.ip = socket.handshake.address;
            that.statusUpdated(config.topics.camera.shooted, data);
        });

        socket.on(config.topics.camera.disable, function(data) {
            //data.ip = socket.handshake.address;
            that.statusUpdated(config.topics.camera.shooted, data);
        });

        socket.on(config.topics.camera.enable, function(data) {
            //data.ip = socket.handshake.address;
            that.statusUpdated(config.topics.camera.enable, data);
        });

        socket.on(config.topics.camera.shooting, function(data) {
            that.statusUpdated(config.topics.camera.shooting, data);
        });

        _.each(config.topics.connection, function(topic) {
            socket.on(topic, function(data) {
                clientId = clientId || data.clientId;
                //data.ip = socket.handshake.address;
                that.statusUpdated(topic, data);
            });
        });

        socket.on("disconnect", function() {
            that.statusUpdated(config.topics.connection.disconnected, {
                clientId: clientId
            });
        });

        // When a broker reconnect, we force all its attached MQTT
        // client to reconnect to it
        //that.reconnect();
    });
};

ShootingServer.prototype.shoot = function(clientId, helloId) {
    debug("Shoot on camera %s", clientId);
    this.io.emit(config.topics.camera.shoot, {
        clientId: clientId,
        helloId: helloId
    });
};
ShootingServer.prototype.disableCamera = function(clientId) {
    debug("Disable camera %s", clientId);
    this.io.emit(config.topics.camera.disable, {
        clientId: clientId
    });
};

ShootingServer.prototype.enableCamera = function(clientId) {
    debug("Enable camera %s", clientId);
    this.io.emit(config.topics.camera.enable, {
        clientId: clientId
    });
};

ShootingServer.prototype.reconnect = function(clientId) {
    debug("Reconnect camera %s", clientId);
    this.io.emit(config.topics.command.reconnect, {
        clientId: clientId
    });
};

ShootingServer.prototype.updateCameraSettings = function(clientId, settings) {
    debug("Update camera settings %s", clientId);
    this.io.emit(config.topics.camera.settings, {
        clientId: clientId,
        settings: settings
    });
};

ShootingServer.prototype.svnUp = function(clientId, username, pwd) {
    debug("SVN UP camera %s with username %s", clientId, username);
    this.io.emit(config.topics.connection.svnup, {
        clientId: clientId,
        username: username,
        pwd: pwd
    });
};

ShootingServer.prototype.turnAlertOn = function(clientId) {
    debug("Turn alert on client %s", clientId);
    this.io.emit(config.topics.camera.turn_alert_on, {
        clientId: clientId
    });
};

ShootingServer.prototype.turnAlertOff = function(clientId) {
    debug("Turn alert off client %s", clientId);
    this.io.emit(config.topics.camera.turn_alert_off, {
        clientId: clientId
    });
};

ShootingServer.prototype.statusUpdated = function(topic, data) {
    var that = this;
    debug("%s from %s", topic, data.clientId);
    if (this._statusCalback && this._statusCalback[topic]) {
        _.each(this._statusCalback[topic], function(callback) {
            callback.call(that, data);
        });
    }
};

ShootingServer.prototype.onStatusUpdate = function(topic, callback) {
    this._statusCalback = this._statusCalback || {};
    this._statusCalback[topic] = this._statusCalback[topic] || [];

    if (this._statusCalback[topic].indexOf(callback) === -1) {
        this._statusCalback[topic].push(callback);
    }
};


ShootingServer.prototype.onClientConnected = function(callback) {
    this.onStatusUpdate(config.topics.connection.connected, callback);
};

ShootingServer.prototype.onClientDisconnected = function(callback) {
    this.onStatusUpdate(config.topics.connection.disconnected, callback);
};

ShootingServer.prototype.onCameraShooted = function(callback) {
    this.onStatusUpdate(config.topics.camera.shooted, callback);
};

ShootingServer.prototype.onSettingsUpdated = function(callback) {
    this.onStatusUpdate(config.topics.status.settings, callback);
};

ShootingServer.prototype.onIPUpdated = function(callback) {
    this.onStatusUpdate(config.topics.status.ip, callback);
};

ShootingServer.prototype.onShooting = function(callback) {
    this.onStatusUpdate(config.topics.camera.shooting, callback);
};

ShootingServer.prototype.onShooted = function(callback) {
    this.onStatusUpdate(config.topics.camera.shooted, callback);
};

ShootingServer.prototype.onCameraEnabled = function(callback) {
    this.onStatusUpdate(config.topics.status.enabled, callback);
};



module.exports = function(settings) {
    return new ShootingServer(settings);
};