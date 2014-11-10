"use strict";
var config = require("../config");
var RaspiCam = require("raspicam");
var path = require("path");
var debug = require("debug")("camera:cam");
var _ = require("underscore");

function Cam(settings) {
    this.settings = settings || _.extend({}, config.raspicam.opts);
    this.settings.output = path.join(__dirname, "..", this.settings.output.path, this.settings.output.filename);
    this.isShooting = false;
    this.requestedShootsStack = [];
}

Cam.prototype.start = function() {
    this.raspiCam = RaspiCam(this.settings);
    this.raspiCam.on("started", function() {
        debug("Raspicam started");
    });

    this.onExited(function() {
        debug("Raspicam exited");
        this.isShooting = false;
        // exit is emited before PROCESS_RUNNING_FLAG is set to false
        setTimeout(this.shootFromStack.bind(this), 0);
    }.bind(this));

    this.onStarted(function() {
        debug("Raspicam started");
    });

    this.raspiCam.on("read", function(err, date, filename) {
        if (err) {
            debug("Error while reading shooted file %s : %s", err, filename);
            return;
        }

        debug("New photo shooted %s", filename);
    });
};

/*Cam.prototype.onShooted = function(callback) {
    this.raspiCam.on("read", this.delegateShootedCallback(callback));
};

Cam.prototype.onceShooted = function(callback) {
    this.raspiCam.once("read", this.delegateShootedCallback(callback));
};*/

Cam.prototype.onStarted = function(callback) {
    this.raspiCam.on("start", callback);
};

Cam.prototype.onExited = function(callback) {
    this.raspiCam.on("exit", callback);
};

Cam.prototype.shootFromStack = function() {
    if (!this.isShooting && this.requestedShootsStack.length) {
        var data = this.requestedShootsStack.shift();
        debug("Shoot from stack");
        this.shoot(data.shootId, data.callback);

        return;
    }

    if (this.isShooting) {
        debug("Can't shoot from stack while shooting");
    }

    if (this.requestedShootsStack.length) {
        debug("Nothing to shoot from the stack");
    }
};

Cam.prototype.shoot = function(helloId, callback) {
    var shootHandler = function(err, date, filename) {
        if (filename && filename.lastIndexOf("~") > -1) {
            return;
        }

        debug("Photo shooted in file %s", filename);
        callback.call(this, err, {
            date: date,
            filename: filename,
            helloId: helloId
        });

        this.raspiCam.removeListener("read", shootHandler);
    }.bind(this);

    if (!this.isShooting) {
        this.isShooting = true;
        this.raspiCam.on("read", shootHandler);
        this.raspiCam.start();
    } else {
        debug("Already shooting, stacking request for later");
        this.requestedShootsStack.push({
            shootId: helloId,
            callback: callback
        });
    }
};

Cam.prototype.setSettings = function(data) {
    var that = this;
    var keys = ["mode", "width", "height", "quality", "timeout", "sharpness", "contrast", "brightness", "saturation", "exposure", "awb", "imxfx", "rotation", "hflip", "vflip"];

    _.each(data.settings, function(value, key) {
        debug("Update camera settings %s = %s", key, value, typeof value);
        if (keys.indexOf(key) === -1) {
            return;
        }

        that.raspiCam.set(key, value);

        if (_.isBoolean(value) && !value && key in that.raspiCam.opts) {
            delete that.raspiCam.opts[key];
        }

    });
};

module.exports = function(settings) {
    return new Cam(settings);
};