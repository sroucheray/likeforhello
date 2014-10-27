/*eslint-env no-underscore-dangle:0*/
"use strict";
var mosca = require("mosca");
var _ = require("underscore");
var config = require("../config.json");
var debug = require("debug")("broker:mqtt");

var defaultMessage = {
    qos: 0,
    retain: false
};

function MQTT(settings) {
    var defaults = {
        port: 1883
    };

    settings = settings || {};
    _.defaults(settings, defaults);

    this.settings = settings;
}

MQTT.prototype.start = function() {
    this.server = new mosca.Server(this.settings);

    this.server.on("ready", function setup() {
        debug("Mosca server started");
    });
};

MQTT.prototype.onClientConnected = function(callback) {
    var that = this;
    this.server.on("clientConnected", function(client) {
        debug("Client connected : %s", client.id);
        callback.call(that, client.id);
    });
};

MQTT.prototype.onClientDisconnected = function(callback) {
    var that = this;
    this.server.on("clientDisconnected", function(client) {
        debug("Client disconnected : %s", client.id);
        callback.call(that, client.id);
    });
};

MQTT.prototype.onPublished = function(callback) {
    var that = this;
    this.server.on("published", function(packet, client) {
        callback.call(that, packet, client);
    });
};

MQTT.prototype.onTopicPublished = function(topic, callback) {
    var that = this;
    this.onPublished(function(packet, client) {
        if (client && packet && packet.topic === topic) {
            debug("'%s' %s = %s", client.id, topic, packet.payload.toString());
            callback.call(that, client.id, packet.payload.toString());
        }
    });
};

MQTT.prototype.onButtonPushedPublished = function(callback) {
    this.onTopicPublished(config.topics.button.pushed, callback);
};

MQTT.prototype.onIPPublished = function(callback) {
    this.onTopicPublished(config.topics.status.ip, callback);
};

MQTT.prototype.onEnabledPublished = function(callback) {
    this.onTopicPublished(config.topics.status.enabled, callback);
};

MQTT.prototype.onTurnedOnPublished = function(callback) {
    this.onTopicPublished(config.topics.status.turned_on, callback);
};

MQTT.prototype.publish = function(settings) {
    var message = {
        topic: settings.topic
    };

    if (settings.clientId) {
        message.payload = settings.clientId;
    }

    _.defaults(message, defaultMessage);

    this.server.publish(message, function() {
        if (settings.clientId) {
            debug(settings.logs.client, settings.clientId);
        } else {
            debug(settings.logs.all);
        }
    });
};

MQTT.prototype.turnAlertOn = function(clientId) {
    this.publish({
        topic: config.topics.alert.turn_on,
        clientId: clientId,
        logs: {
            client: "Turn alert on on '%s' alert module",
            all: "Turn alert on on all connected alert modules"
        }
    });
};

MQTT.prototype.turnAlertOff = function(clientId) {
    this.publish({
        topic: config.topics.alert.turn_off,
        clientId: clientId,
        logs: {
            client: "Turn alert off on '%s' alert module",
            all: "Turn alert off on all connected alert modules"
        }
    });
};

MQTT.prototype.disableAlert = function(clientId) {
    this.publish({
        topic: config.topics.alert.disable,
        clientId: clientId,
        logs: {
            client: "Disable '%s' alert module",
            all: "Disable all connected alert modules"
        }
    });
};

MQTT.prototype.enableAlert = function(clientId) {
    this.publish({
        topic: config.topics.alert.enable,
        clientId: clientId,
        logs: {
            client: "Enable '%s' alert module",
            all: "Enable all connected alert modules"
        }
    });
};

MQTT.prototype.reconnect = function(clientId) {
    var data = {
        topic: config.topics.command.reconnect,
        logs: {
            client: "Reconnect '%s' alert module",
            all: "Reconnect all connected alert modules"
        }
    };

    if(clientId){
        data.clientId = clientId;
    }

    this.publish(data);
};

module.exports = function(settings) {
    return new MQTT(settings);
};