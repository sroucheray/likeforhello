"use strict";
var _ = require("underscore");

function pickSetting(settings, id) {
    return _.find(settings, function(setting) {
        return setting.id === id;
    }).value;
}


module.exports = function(apps) {
    /*
    var shootingServer = apps.shootingServer;
    var brokerServer = apps.brokerServer;
    */
    var redisClient = apps.redisClient;
    var webclient = apps.webclient;
    var databaseClient = apps.databaseClient;
    var brokerServer = apps.brokerServer;
    var shootingServer = apps.shootingServer;
    var facebookClient = apps.facebookClient;
    var debug = apps.debug;

    var stateServer = apps.stateServer;
    databaseClient.getAllSettings().then(function(data) {
        stateServer.setData(data);
        redisClient.updateRandomDelay(parseInt(pickSetting(data.settings, "minRealertDelay"), 10), parseInt(pickSetting(data.settings, "maxRealertDelay"), 10));
    }, function(error) {
        debug("Error while getting all settings");
        debug(error);
    });

    webclient.onReadState(function(req, res, next) {
        var isActive = stateServer.isActive();
        var messages = stateServer.getStateMessage();
        debug("Handle READ state from webclient");
        debug("Is active ? %s", isActive);
        debug("Messages ? %s", messages.join("/"));
        res.end({
            id: "active",
            active: isActive,
            message: messages
        });
    });

    databaseClient.on("settingsUpdate", function(data) {
        stateServer.setData(data);
        webclient.updateState({
            id: "active",
            active: stateServer.isActive(),
            message: stateServer.getStateMessage()
        });
    });

    stateServer.on("transition", function(data) {
        //debug("Transition from %s to %s", data.fromState, data.toState);
        webclient.updateState({
            id: "active",
            active: stateServer.isActive(),
            message: stateServer.getStateMessage()
        });

        webclient.updateState({
            id: "state",
            alert: data.toState === "alert"
        });
    });

    stateServer.on("alertstate", function() {
        debug("!! This is alert state !!");
        webclient.updateState({
            id: "state",
            alert: true
        });
        //TODO:update broker with alert
    });

    //Called in a loop
    //all the queue logic must be here
    stateServer.on("activestate", function() {
        //console.trace("DEBUG STACK")
        databaseClient.getAllSettings().then(function(data) {
            var minVisitorQueueLength = parseInt(pickSetting(data.settings, "minVisitorQueueLength"), 10),
                maxVisitorQueueLength = parseInt(pickSetting(data.settings, "maxVisitorQueueLength"), 10);
            /*,
                minRealertDelay = parseInt(pickSetting(data.settings, "minRealertDelay"), 10),
                maxRealertDelay = parseInt(pickSetting(data.settings, "maxRealertDelay"), 10)*/

            redisClient.getLastAlertDate(function(err, lastDate, durationThreshold) {
                if (err) {
                    debug("Could not get last alert date");
                    debug(err);

                    return;
                }

                var now = Date.now(),
                    diff = now - lastDate;

                if (diff < durationThreshold) {
                    debug("No processing, waiting to reach realert delay : %s < %s", diff, durationThreshold);
                    return;
                }
                debug("Will update queue with num visitors : %s < num < %s", minVisitorQueueLength, maxVisitorQueueLength);
                databaseClient.updateQueue(minVisitorQueueLength, maxVisitorQueueLength).then(function(queues) {
                    debug("Queue has been updated, now has %s visitors", queues.length);
                    webclient.updateSettings({
                        id: "queue",
                        queue: queues.length
                    });

                    if (queues.length >= minVisitorQueueLength) {
                        debug("Num of visitors `%s` is >= to minimum `%s`", queues.length, minVisitorQueueLength);
                        stateServer.transition("alert");
                    }

                    /*if(queues.length){
                        databaseClient.provisionHello();
                    }*/

                }, function(error) {
                    debug("Could not update queue");
                    debug(error);
                });

            });
        }, function(error) {
            debug("Can't keep on processing");
            debug(error);
        });
    });

    /*    brokerServer.onButtonPushed(function(data) {
        debug("Button %s pushed on %s", data.buttonId, data.clientId);
        databaseClient.provisionHello().then(function(hello) {
            var match = data.clientId.match(/button_(.*)/);
            if (match.length > 1) {
                match = "cam_" + match[1];
                debug("Shoot with cam %s", match);
                shootingServer.shoot(match, hello.id);
            }
        });
    });*/


    shootingServer.on("photo:created", function(data) {
        var visitorsNames = [];
        if (data.helloId) {
            debug("Register photo with Hello %s", data.helloId);
            databaseClient.updateHelloWithPhoto(data.helloId, data).then(function() {
                debug("TODO: publish to facebook");
                return databaseClient.getVisitorsWithHello(data.helloId);
            }).then(function(visitors) {
                var promises = [];

                _.each(visitors, function(visitor) {
                    visitorsNames.push(visitor.name);
                    facebookClient.greetingVisitor(visitor, "https://hello.fb.byperiscope.com" + data.filename).then(function(data) {
                        debug("Greeted  %s (%s)", visitor.name, visitor.id);
                        debug(data);
                    }).fail(function(error) {
                        debug("Fail to greet %s (%s)", visitor.name, visitor.id);
                        debug(error);
                    });
                });

                return visitorsNames
            }).then(function(someData) {
                debug("all settled");
                debug(someData)
                return facebookClient.postPhotoOnPage(visitorsNames, "https://hello.fb.byperiscope.com" + data.filename);
            });

        }

        debug("Register orphan photo");
        databaseClient.createOrphanPhoto(data);
    });

    stateServer.on("transition", function(data) {
        if (data.fromState === "alert") {
            redisClient.updateLastAlertDate();
        }
    });

    stateServer.on("alertstate", function() {
        debug("!!! Alert state !!!");
    });

    return stateServer;
};