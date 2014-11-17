"use strict";
var LedMatrix = require("./led/ledMatrix");
var patterns = require("./led/ledPatterns");
var EightByEight = require("eightbyeight");
var debug = require("debug")("camera:led-ctlr");

function LedUtils() {
    var self = this;
    this.eightByEight = new EightByEight();

    this.ledMatrix = new LedMatrix({
        startTransactionMethod: function() {
            self.eightByEight.startTransaction();
        },
        commitTransactionMethod: function() {
            try {
                self.eightByEight.commitTransaction();
            } catch (e) {
                debug("Error while commiting transaction");
                debug(e);
            }
        },
        setLedMethod: function(x, y) {
            //console.log("Set", x, y)
            try {
                self.eightByEight.setPixel(x, 7 - y);
            } catch (e) {
                debug("Error while setting a pixel");
                debug(e);
            }
        },
        clearLedMethod: function(x, y) {
            //console.log("Clear", x, y)
            try {
                self.eightByEight.clearPixel(x, 7 - y);
            } catch (e) {
                debug("Error while clearing a pixel");
                debug(e);
            }
        },
        clearAllLedMethod: function() {
            //console.log("Clear", x, y)
            try {
                self.eightByEight.allOff();
            } catch (e) {
                debug("Error while clearing alk pixel");
                debug(e);
            }
        }
    });
}

LedUtils.prototype.stop = function() {
    this.ledMatrix.stop();
    this.off();
};

LedUtils.prototype.say = function(text, options) {
    this.stop();
    this.ledMatrix.ticker(text, options);
};

LedUtils.prototype.displayChar = function(char) {
    this.ledMatrix.setChar(char);
};

LedUtils.prototype.circle = function() {
    this.stop();
    this.ledMatrix.flashFrames(patterns.shootingFrames, {
        loop: -1,
        duration: 1500
    });
};

LedUtils.prototype.shooting = function() {
    this.stop();
    this.smile({
        loop: 5,
        duration: 800
    });
};

LedUtils.prototype.blink = function(options) {
    this.stop();
    this.ledMatrix.flashFrames([patterns.eye, patterns.eye2], options);
};

LedUtils.prototype.smile = function(options) {
    this.stop();
    this.ledMatrix.flashFrames([patterns.neutral, patterns.smile], options);
};

LedUtils.prototype.sadFace = function(options) {
    this.stop();
    this.ledMatrix.flashFrames([patterns.neutral, patterns.nosmile], options);
};

LedUtils.prototype.alert = function(options) {
    this.stop();
    this.ledMatrix.flashFrames([patterns.full, patterns.empty], options);
};

LedUtils.prototype.cross = function() {
    this.stop();
    this.ledMatrix.setFrame(patterns.cross);
};

LedUtils.prototype.off = function() {
    this.ledMatrix.setFrame(patterns.empty);
};

LedUtils.prototype.countDown = function(num, callback) {
    num = num || 3;

    function updateCount(){
        if(num === 0){
            callback();
        }
       this.displayChar(num+"");
       num--;
       setTimeout(updateCount, 1000);
    }.bind(this);

    updateCount();
};

module.exports = function(options) {
    return new LedUtils(options);
};
