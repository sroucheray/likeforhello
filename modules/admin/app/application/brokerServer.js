"use strict";
var socketIO = require("socket.io");
var config = require("../../../broker/config.json");
var _ = require("underscore");
var debug = require("debug")("admin:broker");

function BrokerServer(socketServer) {
    this.socketServer = socketServer;
}

BrokerServer.prototype.start = function() {
    debug("Broker server started");
    var that = this;
    this.io = this.socketServer.of("/broker");

    this.io.on("connection", function(socket) {
        var broker_ip;
        debug("New broker connected : %s", socket.handshake.address);

        that.statusUpdated("broker_connected", {
                broker_ip: broker_ip,
                clientId : "broker"
            });
        // There seem no to be an easy way to listen (.on) to all sockets
        // at the same time
        // Listen to all topics on all connected client
        _.each(config.topics.status, function(topic) {
            socket.on(topic, function(data) {
                if (data.broker_ip) {
                    broker_ip = data.broker_ip;
                }
                //data.broker_ip = socket.handshake.address;
                that.statusUpdated(topic, data);
            });
        });

        socket.on(config.topics.button.pushed, function(data) {
            //data.broker_ip = socket.handshake.address;
            that.statusUpdated(config.topics.button.pushed, data);
        });

        _.each(config.topics.connection, function(topic) {
            socket.on(topic, function(data) {
                //data.broker_ip = socket.handshake.address;
                that.statusUpdated(topic, data);
            });
        });

        socket.on("disconnect", function() {
            debug("Broker disconnected %s", broker_ip);
            that.statusUpdated("broker_disconnected", {
                broker_ip: broker_ip,
                clientId : "broker"
            });
        });

        // When a broker reconnect, we force all its attached MQTT
        // client to reconnect to it
        that.reconnect();
    });
};

BrokerServer.prototype.turnAlertOn = function(clientId) {
    debug("Turn alert on %s", clientId);
    this.io.emit(config.topics.alert.turn_on, {
        clientId: clientId
    });
};

BrokerServer.prototype.turnAlertOff = function(clientId) {
    debug("Turn alert off %s", clientId);
    this.io.emit(config.topics.alert.turn_off, {
        clientId: clientId
    });
};

BrokerServer.prototype.disableAlert = function(clientId) {
    debug("Disable alert %s", clientId);
    this.io.emit(config.topics.alert.disable, {
        clientId: clientId
    });
};

BrokerServer.prototype.enableAlert = function(clientId) {
    debug("Enable alert %s", clientId);
    this.io.emit(config.topics.alert.enable, {
        clientId: clientId
    });
};

BrokerServer.prototype.reconnect = function(clientId) {
    debug("Reconnect module %s", clientId);
    this.io.emit(config.topics.command.reconnect, {
        clientId: clientId
    });
};

BrokerServer.prototype.statusUpdated = function(topic, data) {
    var that = this;
    debug("%s from %s", topic, data.clientId)
    if (this._statusCalback && this._statusCalback[topic]) {
        _.each(this._statusCalback[topic], function(callback) {
            callback.call(that, data);
        });
    }
};

BrokerServer.prototype.onStatusUpdate = function(topic, callback) {
    this._statusCalback = this._statusCalback || {};
    this._statusCalback[topic] = this._statusCalback[topic] || [];

    if (this._statusCalback[topic].indexOf(callback) === -1) {
        this._statusCalback[topic].push(callback);
    }
};

BrokerServer.prototype.onConnected = function(callback) {
    this.onStatusUpdate("broker_connected", callback);
};

BrokerServer.prototype.onDisconnected = function(callback) {
    this.onStatusUpdate("broker_disconnected", callback);
};

BrokerServer.prototype.onClientConnected = function(callback) {
    this.onStatusUpdate(config.topics.connection.connected, callback);
};

BrokerServer.prototype.onClientDisconnected = function(callback) {
    this.onStatusUpdate(config.topics.connection.disconnected, callback);
};

BrokerServer.prototype.onButtonPushed = function(callback) {
    this.onStatusUpdate(config.topics.button.pushed, callback);
};

BrokerServer.prototype.onIPUpdate = function(callback) {
    this.onStatusUpdate(config.topics.status.ip, callback);
};

BrokerServer.prototype.onEnabledUpdate = function(callback) {
    this.onStatusUpdate(config.topics.status.enabled, callback);
};

BrokerServer.prototype.onTurnedOnUpdate = function(callback) {
    this.onStatusUpdate(config.topics.status.turned_on, callback);
};

module.exports = function(settings) {
    return new BrokerServer(settings);
};