"use strict";
var _ = require("lodash");
var machina = require("machina")(_);
var debug = require("debug")("admin:fsm");

module.exports = function() {

    var machine = new machina.Fsm({
        initialize: function() {
            this.invalidateState();
            this.on("transition", function(data) {
                debug("Transition from %s to %s", data.fromState, data.toState);
                //debug(data);
            });
            this.loopInterval = 1000 * 60;
        },
        invalidateState : function(){
            this.stateInvalidation = true;
        },
        setOperationDates: function(startDate, endDate) {
            this.startDate = startDate;
            this.endDate = endDate;

            this.invalidateState();
        },
        setTimetable: function(timetable) {
            this.timetable = timetable;

            this.invalidateState();
        },
        isActive: function() {
            //if (this.stateInvalidation) {
            //debug("In isActive A, state : %s", this.state);
                return this.checkState();
            //}

            //debug("In isActive B, state : %s", this.state);

            //return this.state === "active" || this.state !== "alert";
        },
        activate: function(active) {
            debug(active ? "Activate the operation" : "Deactivate the operation");
            this.enabled = active;

            if (this.stateInvalidation) {
                return this.checkState();
            }
        },
        stackMessage: function(message, deceptive) {
            if (!this.messages) {
                this.messages = [];
            }
            debug((deceptive ? "...mais " : "") + message);
            this.messages.push(message);
        },
        checkState: function() {
            //console.trace("DEBUG STACK")
            debug("Check state");
            this.stateInvalidation = false;
            this.messages = [];
            var today = new Date(),
                now = today.getTime(),
                dayOfWeek = today.getDay(),
                todayTimetable = this.timetable[dayOfWeek];

            if (this.endDate < this.startDate) {
                this.stackMessage("les dates de début et de fin de l'opération sont inversées", true);
                this.transition("inactive");
                return false;
            }

            if (now < this.startDate) {
                this.stackMessage("nous sommes avant le début de l'opération");
                this.transition("inactive");
                return false;
            }

            this.stackMessage("Nous sommes après le début de l'opération");

            if (now > this.endDate) {
                this.stackMessage("nous sommes après la fin de l'opération", true);
                this.transition("inactive");
                return false;
            }

            this.stackMessage("Nous sommes avant la fin de l'opération");

            var currentHour = today.getHours() * 60 + today.getMinutes(),
                openHours = todayTimetable.open_hour * 60 + todayTimetable.open_minute,
                closeHours = todayTimetable.close_hour * 60 + todayTimetable.close_minute;

            if (closeHours < openHours) {
                this.stackMessage("les horaires d'ouverture et de fermeture sont inversées", true);
                this.transition("inactive");
                return false;
            }

            if (currentHour < openHours) {
                this.stackMessage("nous sommes avant l'heure d'ouverture", true);
                this.transition("inactive");
                return false;
            }


            if (currentHour > closeHours) {
                this.stackMessage("nous sommes après l'heure de fermeture", true);
                this.transition("inactive");
                return false;
            }

            this.stackMessage("Nous sommes dans les horaires d'ouverture");

            if (!todayTimetable.enabled) {
                this.stackMessage("aujourd'hui n'est pas un jour actif", true);
                this.transition("inactive");
                return false;
            }

            this.stackMessage("Nous sommes un jour actif");

            if (!this.enabled) {
                this.stackMessage("l'arrêt temporaire a été activé", true);
                this.transition("inactive");
                return false;
            }

            this.stackMessage("L'opération est donc en cours");

            if (this.state !== "alert") {
                this.transition("active");
                this.emit("updatequeue");
            }

            if (this.state === "alert") {
                this.emit("alertstate");
                this.emit("updatequeue");
            }

            return true;
        },
        getStateMessage: function() {
            return this.messages;
        },
        setData: function(data) {
            var startDate = _.find(data.settings, function(setting) {
                return setting.id === "startDate";
            });
            var endDate = _.find(data.settings, function(setting) {
                return setting.id === "endDate";
            });
            var isPaused = _.find(data.settings, function(setting) {
                return setting.id === "isPaused";
            });

            this.setOperationDates(parseInt(startDate.value, 10), parseInt(endDate.value, 10), true);
            this.setTimetable(data.timetable, true);
            this.activate(!parseInt(isPaused.value, 10));

            this.invalidateState();

            if (!this.looped) {
                this.looped = true;
                setTimeout(this.loop.bind(this), this.loopInterval);
            }

        },
        loop: function() {
            this.checkState();
            setTimeout(this.loop.bind(this), this.loopInterval);
        },
        initialState: "ready",
        states: {
            ready: {
                _onEnter: function() {
                    debug("Entering ready state");
                }
            },
            inactive: {
                _onEnter: function() {
                    debug("Entering inactive state");
                }

            },
            active: {
                _onEnter: function() {
                    debug("Entering active state");
                }
            },
            alert: {
                _onEnter: function() {
                    debug("Entering alert state");
                }
            }
        }
    });

    return machine;
};