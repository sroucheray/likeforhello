"use strict";
var config = require("../config");
var io = require("socket.io-client");
var debug = require("debug")("camera:socket-client");
var fs = require("fs");

function SocketClient(server) {
    this.server = server || config.server;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

SocketClient.prototype.start = function() {
    var that = this;
    this.client = io(this.server, {
        transports: ["websocket"],
        secure: true,
        timeout: 60 * 60 * 1000
    });
    debug("Socket client connecting to server '%s'", this.server);
    that.client.on("connect", function() {
        debug("Socket client connected to server");

        that.client.on("disconnect", function() {
            debug("Socket client disconnected");
        });

        that.client.on("reconnect", function() {
            debug("Socket client reconnect");
        });

        that.statusUpdate(config.topics.connection.connected, {
            clientId: config.id,
            shooting: false,
            enabled: true
        });


        var os = require("os");
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
            var alias = 0;
            ifaces[dev].forEach(function(details) {
                if (details.family == "IPv4") {
                    console.log(dev + (alias ? ":" + alias : ""), details.address);

                    if(details.address !== "127.0.0.1"){
                        that.statusUpdate(config.topics.status.ip, {
                            ip: details.address,
                            clientId: config.id
                        });
                    }

                    ++alias;
                }
            });
        }


        /*        that.statusUpdate(config.topics.status.ip, {
            clientId: config.id,
            ip: ip.address()
        });*/
    });

    that.client.on("connect_error", function(data) {
        debug("Socket client connection error");
    });

    that.client.on("reconnect_attempt", function(data) {
        debug("Socket client reconnect attempt", data);
    });

    that.client.on("reconnect_failed", function(data) {
        debug("Socket client reconnection failed", data);
        that.start();
    });
};

SocketClient.prototype.onShootRequested = function(callback) {
    var that = this;
    this.client.on(config.topics.camera.shoot, function(data) {
        debug("Socket message received : shoot %s", data.shootId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onSettingsUpdated = function(callback) {
    var that = this;
    this.client.on(config.topics.camera.settings, function(data) {
        debug("Socket message received : settings update", data);
        callback.call(that, data);
    });
};

SocketClient.prototype.photoShooted = function(file, shootId) {
    var that = this;

    fs.readFile(file, function(err, buf) {
        if (err) {
            debug("Error while reading file %s : %s", file, err);
            //TODO: May emit an error ?
            return;
        }

        debug("Socket message send photo shooted %s", file);

        that.client.emit(config.topics.camera.shoot, {
            shootId: shootId,
            image: true,
            buffer: buf
        });
    });
};
SocketClient.prototype.onCameraDisable = function(callback) {
    var that = this;
    this.client.on(config.topics.camera.disable, function(data) {
        debug("Socket message received : camera disable on %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onCameraEnable = function(callback) {
    var that = this;
    this.client.on(config.topics.camera.enable, function(data) {
        debug("Socket message received : camera enable on %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onReconnect = function(callback) {
    var that = this;
    this.client.on(config.topics.command.reconnect, function(data) {
        debug("Socket message received : reconnect %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onSVNup = function(callback) {
    var that = this;
    this.client.on(config.topics.connection.svnup, function(data) {
        debug("Socket message received : SVN UP %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onTurnAlertOn = function(callback) {
    var that = this;
    this.client.on(config.topics.camera.turn_alert_on, function(data) {
        debug("Socket message received : turn alert on %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onTurnAlertOff = function(callback) {
    var that = this;
    this.client.on(config.topics.camera.turn_alert_off, function(data) {
        debug("Socket message received : turn alert off %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.statusUpdate = function(topic, data) {
    debug("Socket message send update status %s", topic);
    this.client.emit(topic, data);
};

module.exports = function(server) {
    return new SocketClient(server);
};