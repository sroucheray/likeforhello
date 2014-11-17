/*eslint-env node*/
"use strict";
var redis = require("redis");
var _ = require("underscore");
var config = require("../../config.json");
var debug = require("debug")("admin:redis");

function parseData(data) {
    var parsed = {
        "true": true,
        "false": false
    };
    _.each(data, function(value, key) {
        if (value in parsed) {
            data[key] = parsed[value];
        }
    });

    return data;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function RedisClient(settings) {
    this.settings = settings || config;
}

RedisClient.prototype.start = function() {
    var that = this;
    this.client = redis.createClient(this.settings.redis.port, this.settings.redis.host);
    _.each(this.settings.modules, function(modules, type) {
        _.each(modules, function(content, module) {
            /*that.client.hdel.call(that.client, module, "is_disconnect");
            that.client.hdel.call(that.client, module, "is_connect");*/

            function setInfos(result) {
                var commonData = {
                    "type": type,
                    "id": module,
                    "is_connected": false,
                    "disconnected_at": new Date().getTime()
                };

                var specificData = {};

                if (type === "cam") {
                    specificData = config.camera.defaults;
                    specificData.pwd = "";
                } else {
                    specificData = {
                        "mac": that.settings.modules[type][module].mac ? that.settings.modules[type][module].mac.join("-") : "N/A",
                        "spared": !!that.settings.modules[type][module].spared
                    };
                }
                var resultData = _.extend({}, specificData, result, commonData);
                that.setModuleInfos(module, resultData);
            }

            if (type === "cam") {
                that.getModuleInfos(module, function(err, result) {
                    if (err) {
                        debug("Can't get infos for module");
                        setInfos();

                        return;
                    }

                    setInfos(result);
                });
            } else {
                setInfos();
            }
        });
    });

    this.client.on("error", function(err) {
        debug("Error : " + err);
    });
};

RedisClient.prototype.setModuleInfos = function(clientId, infos, callback) {
    debug("Set module infos %s", clientId);
    if (infos.pwd) {
        infos.pwd = "";
    }
    //debug(infos);

    infos = _.chain(infos).pairs().flatten().value();
    infos.unshift(clientId);

    //console.log(infos)

    this.client.hmset.apply(this.client, infos);

    this.getModuleInfos(clientId, callback);
};

RedisClient.prototype.getAllModulesInfos = function(callback, lastCallback) {
    var that = this;
    var modules = [];
    var numRequests = 0;

    _.each(this.settings.modules, function(mods, type) {
        modules = modules.concat(_.keys(mods));
    });

    _.each(modules, function(name) {
        that.getModuleInfos(name, function(err, result) {
            numRequests++;
            callback.call(that, err, parseData(result));
            if (numRequests === modules.length && typeof lastCallback === "function") {
                lastCallback();
            }
        });
    });
};

RedisClient.prototype.getModuleInfos = function(clientId, callback) {
    var that = this;
    if (typeof callback === "function") {
        this.client.hgetall(clientId, function(err, result) {
            callback.call(that, err, parseData(result));
        });
    }
};

RedisClient.prototype.updateRandomDelay = function(min, max) {
    var random = getRandomInt(min, max);
    debug("Update random alert delay to : %s < %s < %s", min, random, max);
    this.client.hmset.call(this.client, "alert", {
        "nextrandom": random
    });
};

RedisClient.prototype.updateLastAlertDate = function() {
    var now = Date.now();
    debug("Update last alert date to : %s", now);
    this.client.hmset.call(this.client, "alert", {
        "lastdate": now
    });
};

RedisClient.prototype.getLastAlertDate = function(callback) {
    var that = this;
    this.client.hgetall.call(this.client, "alert", function(err, result) {
        var lastdate = (result && result.lastdate && parseInt(result.lastdate, 10)) || 0;
        var random = parseInt(result.nextrandom, 10);
        debug("Last date is %s", lastdate);
        callback.call(that, err, lastdate, random * 1000);
    });
};


module.exports = function(settings) {
    return new RedisClient(settings);
};