/*eslint camelcase:0 */
"use strict";
var backboneio = require("backbone.io");
var debug = require("debug")("admin:webclient");

function WebClient(settings) {
    this.server = settings;
    //console.log("1", this.server);
}

WebClient.prototype.start = function() {
    /*    this.moduleBackend = backboneio.createBackend();
    this.moduleBackend.use(function(req, res, next) {
        debug("Request module '%s' from webclient", req.method);
        next();
    });

    this.settingsBackend = backboneio.createBackend();
    this.settingsBackend.use(function(req, res, next) {
        debug("Request setting '%s' from webclient", req.method);
        next();
    });


    this.stateBackend = backboneio.createBackend();
    this.stateBackend.use(function(req, res, next) {
        debug("Request state '%s' from webclient", req.method);
        next();
    });


    this.statistics = backboneio.createBackend();
    this.statistics.use(function(req, res, next) {
        debug("Request statistics '%s' from webclient", req.method);
        next();
    });*/
    var backendsData = [{
        name: "Module",
        backend: "moduleBackend"
    }, {
        name: "Settings",
        backend: "settingsBackend"
    }, {
        name: "State",
        backend: "stateBackend"
    }, {
        name: "Statistics",
        backend: "statisticsBackend"
    }, {
        name: "Photos",
        backend: "photoBackend"
    }, {
        name: "Data",
        backend: "dataBackend"
    }],
        backends = {};


    backendsData.forEach(function(backendData) {
        var lowerCaseName = backendData.name.toLowerCase();
        debug("Create socket backend : %s", lowerCaseName);
        var newBackend = backboneio.createBackend();
        this[backendData.backend] = newBackend;
        this[backendData.backend].use(function(req, res, next) {
            debug("%s %s", req.method.toUpperCase(), lowerCaseName);
            next();
        });
        backends[backendData.backend] = newBackend;


        WebClient.prototype["onRead" + backendData.name] = function(callback) {
            newBackend.use("read", callback);
        };

        WebClient.prototype["onUpdate" + backendData.name] = function(callback) {
            newBackend.use("update", callback);
        };

        WebClient.prototype["onPatch" + backendData.name] = function(callback) {
            newBackend.use("patch", callback);
        };

        WebClient.prototype["emit" + backendData.name] = function(command, data) {
            debug("'%s' %s '%s'", command, lowerCaseName, data.id);
            return newBackend.emit(command, data);
        };


        WebClient.prototype["create" + backendData.name] = function(data) {
            return this["emit" + backendData.name]("created", data);
        };

        WebClient.prototype["update" + backendData.name] = function(data) {
            return this["emit" + backendData.name]("updated", data);
        };

        WebClient.prototype["delete" + backendData.name] = function(data) {
            return this["emit" + backendData.name]("deleted", data);
        };
    }.bind(this));

    backboneio.listen(this.server, backends).set("log level", 1);

};

/* Handle request from web client */
/*WebClient.prototype.onReadModule = function(callback) {
    this.moduleBackend.use("read", callback);
};

WebClient.prototype.onUpdateModule = function(callback) {
    this.moduleBackend.use("update", callback);
};

WebClient.prototype.onPatchModule = function(callback) {
    this.moduleBackend.use("patch", callback);
};*/

/* -- */
/*WebClient.prototype.onReadSettings = function(callback) {
    this.settingsBackend.use("read", callback);
};

WebClient.prototype.onUpdateSettings = function(callback) {
    this.settingsBackend.use("update", callback);
};

WebClient.prototype.onPatchSettings = function(callback) {
    this.settingsBackend.use("patch", callback);
};*/

/* -- */

/*WebClient.prototype.onReadState = function(callback) {
    this.stateBackend.use("read", callback);
};

WebClient.prototype.emitState = function(command, data) {
    debug("'%s' state '%s'", command, data.id);
    //debug(data);
    return this.stateBackend.emit(command, data);
};

WebClient.prototype.updateState = function(data) {
    return this.emitState("updated", data);
};*/

/* -- */
/*WebClient.prototype.onReadStatistic = function(callback) {
    this.statistics.use("read", callback);
};

WebClient.prototype.onUpdateStatistic = function(callback) {
    this.statistics.use("update", callback);
};

WebClient.prototype.onPatchStatistic = function(callback) {
    this.statistics.use("patch", callback);
};*/

/* Publish event to client */

/*WebClient.prototype.emitModule = function(command, data) {
    debug("'%s' module '%s'", command, data.id);
    //debug(data);
    return this.moduleBackend.emit(command, data);
};

WebClient.prototype.createModule = function(data) {
    return this.emitModule("created", data);
};

WebClient.prototype.updateModule = function(data) {
    return this.emitModule("updated", data);
};

WebClient.prototype.deleteModule = function(data) {
    return this.emitModule("deleted", data);
};*/

/* -- */
/*WebClient.prototype.emitSettings = function(command, data) {
    data.id = data.name;
    debug("'%s' setting '%s'", command, data.id);
    //debug(data);
    return this.settingsBackend.emit(command, data);
};

WebClient.prototype.createSettings = function(data) {
    return this.emitSettings("created", data);
};

WebClient.prototype.updateSettings = function(data) {
    return this.emitSettings("updated", data);
};

WebClient.prototype.deleteSettings = function(data) {
    return this.emitSettings("deleted", data);
};*/


module.exports = function(settings) {
    return new WebClient(settings);
};