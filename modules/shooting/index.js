"use strict";

var enabled = true;
var config = require("./config");
var debug = require("debug")("camera:server");


if (!config.id || config.id === "") {
    debug("You need to provide an id before starting this server");
    process.exit(1);
}

process.on("exit", function(code) {
    if (ledController) {
        ledController.stop();
    }
});

var cam = require("./app/cam")();
var socketClient = require("./app/socketClient")();
var ledController = require("./app/ledController")();
var path = require("path");
var fs = require("fs");

cam.start();
socketClient.start();

cam.onStarted(function() {
    debug("Publish shooting status");
    socketClient.statusUpdate(config.topics.camera.shooting, {
        clientId: config.id
    });
});

socketClient.onShootRequested(function(requestData) {
    var color = ["verte", "jaune", "bleue"];
    var floor = {
        "cam_ground": "Plus rapide a la cafet'",
        "cam_1stfloor": "Plus rapide au 1er",
        "cam_2ndfloor": "Plus rapide au 2ème"
    };
    //clientId
    //buttonId
    //helloId

    if (requestData.clientId !== config.id) {
        debug("Shoot requested for '%s', but I am another cam : '%s' ", requestData.clientId, config.id);
        if (requestData.helloId) {
            ledController.say(floor[requestData.clientId], {
                duration: 2000,
                endCallback: function() {
                    ledController.stop();
                }
            });
        }
        return;
    }

    if (!enabled) {
        debug("Shoot requested for '%s', but I am not enabled", requestData.clientId);
        return;
    }

    debug("Shoot requested for '%s'", requestData.clientId);

    ledController.shooting();

    cam.shoot(requestData.helloId, function(err, data) {
        if (err) {
            debug("Error while shooting");
            debug(err);

            return;
        }

        data.clientId = config.id;

        if (!data.filename) {
            debug("No filename produced for this shoot");

            return;
        }

        if (requestData.helloId) {
            debug("l'equipe " + color[requestData.buttonId + 1] + " gagne !", requestData.buttonId)
            ledController.say("l'equipe " + color[requestData.buttonId] + " gagne !", {
                duration: 3000,
                endCallback: function() {
                    ledController.stop();
                }
            });
        } else {
            ledController.say("Done !", {
                duration: 1000,
                endCallback: function() {
                    ledController.stop();
                }
            });
        }

        /*ledController.smile({
            loop: 3,
            endCallback: function() {
                ledController.stop();
            }
        });*/

        var imageBuffer = fs.readFileSync(path.join(__dirname, config.raspicam.opts.output.path, data.filename));

        data.imageBuffer = imageBuffer;

        data.enabled = enabled;

        socketClient.statusUpdate(config.topics.camera.shooted, data);
        //data.filename
        //data.shootId
        //data.notRequested
    });
});

socketClient.onCameraDisable(function(data) {
    if (data.clientId !== config.id) {
        debug("Enable request for '%s', but I am another cam : '%s' ", data.clientId, config.id);

        return;
    }
    enabled = false;
    ledController.cross();
    socketClient.statusUpdate(config.topics.status.enabled, {
        clientId: config.id,
        enabled: enabled
    });
});

socketClient.onCameraEnable(function(data) {
    if (data.clientId !== config.id) {
        debug("Enable request for '%s', but I am another cam : '%s' ", data.clientId, config.id);

        return;
    }
    enabled = true;
    ledController.stop();
    socketClient.statusUpdate(config.topics.status.enabled, {
        clientId: config.id,
        enabled: enabled
    });
});

socketClient.onSettingsUpdated(function(data) {
    if (data.clientId !== config.id) {
        debug("Update settings requested for '%s', but I am another cam : '%s' ", data.clientId, config.id);

        return;
    }
    cam.setSettings(data);
    socketClient.statusUpdate(config.topics.status.settings, data);
});

socketClient.onTurnAlertOn(function(data) {
    if (data.clientId !== config.id) {
        debug("Turn alert ON requested for '%s', but I am another cam : '%s' ", data.clientId, config.id);

        return;
    }


    ledController.alert({
        loop: -1,
        duration: 1000
    });
});

socketClient.onTurnAlertOff(function(data) {
    if (data.clientId !== config.id) {
        debug("Turn alert OFF requested for '%s', but I am another cam : '%s' ", data.clientId, config.id);

        return;
    }

    ledController.stop();

    if (!enabled) {
        ledController.cross();
    }
});

socketClient.onSVNup(function(data) {
    if (data.clientId !== config.id) {
        debug("SVN UP requested for '%s', but I am another cam : '%s' ", data.clientId, config.id);

        return;
    }
    debug("SVN UP requested for '%s' with 'username'", data.clientId, data.username);

    var Client = require("svn-spawn");
    var client = new Client({
        cwd: process.cwd(),
        username: data.username,
        password: data.pwd
    });

    client.update("--non-interactive", function(err, data) {
        if (err) {
            debug("Error while SVN UP");
            debug(data);

            return;
        }

        debug("SVN updated fine");
        debug(data);

        var pm2 = require("pm2");

        // Connect or launch PM2
        pm2.connect(function(err) {
            if (err) {
                debug("Can't connect to pm2, you need to restart manually");
                debug(err);
                return;
            }
            pm2.restart("all", function(err, proc) {
                if (err) {
                    debug("Can't restart process with pm2, you need to restart manually");

                    debug(err);

                    return;
                }

                debug("Restarting all process");
                debug(proc);

            });
        });
    });

});