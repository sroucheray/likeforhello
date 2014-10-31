"use strict";
var config = require("../config.json");
var io = require("socket.io-client");
var debug = require("debug")("broker:socket-client");

function SocketClient(server) {
    this.server = server || config.server;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

SocketClient.prototype.start = function() {
    var that = this;
    this.client = io(this.server, {
        transports: ["websocket"],
        secure: true
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


    var os = require("os");
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var alias = 0;
        ifaces[dev].forEach(function(details) {
            if (details.family == "IPv4") {
                console.log(dev + (alias ? ":" + alias : ""), details.address);

                if (details.address !== "127.0.0.1") {
                    that.ip = details.address;
                    that.keepAlive(details.address);

                }

                ++alias;
            }
        });
    }

    debug("Broker ip is %s", this.ip);
};

SocketClient.prototype.keepAlive = function(ipAddress) {
    var that = this;
    debug("Keep alive w/ IP status %s", ipAddress);

    this.statusUpdate(config.topics.status.ip, {
        ip: ipAddress
    });

    setTimeout(function() {
        that.periodicUpdate(ipAddress);
    }, 1000 * 60 * 10);
};

SocketClient.prototype.onAlertTurnOn = function(callback) {
    var that = this;
    this.client.on(config.topics.alert.turn_on, function(data) {
        debug("Socket message received : alert turn on %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onAlertTurnOff = function(callback) {
    var that = this;
    this.client.on(config.topics.alert.turn_off, function(data) {
        debug("Socket message received : alert turn off %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onAlertDisable = function(callback) {
    var that = this;
    this.client.on(config.topics.alert.disable, function(data) {
        debug("Socket message received : alert disable on %s", data.clientId);
        callback.call(that, data);
    });
};

SocketClient.prototype.onAlertEnable = function(callback) {
    var that = this;
    this.client.on(config.topics.alert.enable, function(data) {
        debug("Socket message received : alert enable on %s", data.clientId);
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

SocketClient.prototype.buttonPushed = function(buttonId, clientId) {
    var that = this;
    debug("Socket message send button %s pushed on client %s", buttonId, clientId);
    this.client.emit(config.topics.button.pushed, {
        buttonId: buttonId,
        clientId: clientId,
        broker_ip: this.ip
    });
};

SocketClient.prototype.statusUpdate = function(topic, data) {
    data.broker_ip = this.ip;
    debug("Socket message send update status %s (broker IP %s)", topic, this.ip);
    this.client.emit(topic, data);
};

module.exports = function(server) {
    return new SocketClient(server);
};