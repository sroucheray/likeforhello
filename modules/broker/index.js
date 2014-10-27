"use strict";
var config = require("./config.json");
var mqttServer = require("./app/mqttServer")();
var socketClient = require("./app/socketClient")();
var debug = require("debug")("broker:broker");

debug("Broker booting...");

socketClient.start();
mqttServer.start();

mqttServer.onClientConnected(function(clientId) {
    socketClient.statusUpdate(config.topics.connection.connected, {
        clientId: clientId
    });
});

mqttServer.onClientDisconnected(function(clientId) {
    socketClient.statusUpdate(config.topics.connection.disconnected, {
        clientId: clientId
    });
});

mqttServer.onButtonPushedPublished(function(clientId, buttonId) {
    socketClient.statusUpdate(config.topics.button.pushed, {
        clientId: clientId,
        buttonId: buttonId
    });
});

mqttServer.onIPPublished(function(clientId, ip) {
    socketClient.statusUpdate(config.topics.status.ip, {
        clientId: clientId,
        ip: ip
    });
});

mqttServer.onEnabledPublished(function(clientId, enabled) {
    enabled = enabled === "true" ? true : false;
    socketClient.statusUpdate(config.topics.status.enabled, {
        clientId: clientId,
        enabled: enabled
    });
});

mqttServer.onTurnedOnPublished(function(clientId, on) {
    on = on === "true" ? true : false;
    socketClient.statusUpdate(config.topics.status.turned_on, {
        clientId: clientId,
        on: on
    });
});

socketClient.onAlertTurnOn(function(data) {
    mqttServer.turnAlertOn(data.clientId);
});

socketClient.onAlertTurnOff(function(data) {
    mqttServer.turnAlertOff(data.clientId);
});

socketClient.onAlertDisable(function(data) {
    mqttServer.disableAlert(data.clientId);
});

socketClient.onAlertEnable(function(data) {
    mqttServer.enableAlert(data.clientId);
});

socketClient.onReconnect(function(data) {
    mqttServer.reconnect(data.clientId);
});

/*function testMQTT(){
    mqttServer.turnAlertOn();
    mqttServer.turnAlertOff();
    mqttServer.disableAlert();
    mqttServer.enableAlert();
    mqttServer.reconnectAlert("anotherClient");
    mqttServer.reconnectAlert("arduinoClient");
    setTimeout(testMQTT,10000);
}

testMQTT();*/


/*publish();

function publish(){
    server.publish(message, function() {
        console.log("done!", arguments);
    });
    setTimeout(function(){
        publish();
    }, 4000);
}*/