"use strict";

var path = require("path");
var fs = require("fs");
var config = require("../config");
var socketio = require("socket.io");

var webserver = require("./application/webServer")().start();
var socketServerSecured = socketio.listen(webserver.getBrokerHTTPSServer());
var webclient = require("./application/webClient")(webserver.getPublicHTTPSServer());
var brokerServer = require("./application/brokerServer")(socketServerSecured);
var shootingServer = require("./application/shootingServer")(socketServerSecured);
var databaseClient = require("./application/databaseClient");
var facebookClient = require("./application/facebookClient")();
var stateServer = require("./application/stateServer")();

var redisClient = require("./application/redisClient")();
var debug = require("debug")("admin:server");

redisClient.start();
webclient.start();
brokerServer.start();
shootingServer.start();


fs.readdirSync(path.join(__dirname, "init")).forEach(function(file) {
    if(file.indexOf("init") !== 0){
        return;
    }
    require(path.join(__dirname, "init", file))({
        webserver: webserver,
        socketServerSecured: socketServerSecured,
        webclient: webclient,
        brokerServer: brokerServer,
        shootingServer: shootingServer,
        redisClient: redisClient,
        databaseClient: databaseClient,
        debug: debug,
        config: config,
        stateServer: stateServer,
        facebookClient: facebookClient
    });
});



module.exports = true;