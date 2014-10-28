"use strict";
var express = require("express");
var fs = require("fs");
var path = require("path");
var debug = require("debug")("admin:webserver");
var hbs = require("express-hbs");
var passport = require("passport");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var compression = require("compression");
var qt = require("quickthumb");
var debugReq = require("debug")("admin:request");

function WebServer(settings) {
    this.config = settings || require("../../config.json");
}

WebServer.prototype.setupAdminApp = function() {
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/super/login");
    }

    function forceSecureConnection(req, res, next) {
        if (!req.secure) {
            res.redirect("https://" + req.hostname + req.url);
            return;
        }
        next();
    }
    //this.publicApp.use(compression());
    // assign the handlebars engine to .handlebars files
    /*this.publicApp.engine("hbs", hbs.express3({
        partialsDir: path.join(__dirname, "../admin/public/scripts/views/partials")
    }));*/
    //this.publicApp.disable("x-powered-by");
    // set .handlebars as the default extension
    //this.publicApp.set("view engine", "hbs");
    //this.publicApp.set("views", path.join(__dirname, "../admin/public/scripts/views"));
    /*this.publicApp.use(function(req, res, next) {
        debugReq("%s %s", req.method, req.url);
        next();
    });*/


    this.publicApp.all("*", forceSecureConnection);
    //this.publicApp.use(express.static("bower_components"));
    //this.publicApp.use(express.static("app/admin/public"));
    //this.publicApp.use("/views", express.static("app/admin/public/scripts/views"));
    this.publicApp.use("/super", session({
        secret: "thisisthelikeforhelloproto",
        resave: true,
        saveUninitialized: true
    }));
    this.publicApp.use("/super", passport.initialize());
    this.publicApp.use("/super", passport.session()); // persistent login sessions
    this.publicApp.use("/super", bodyParser.urlencoded({
        extended: true
    }));
    //this.publicApp.use(bodyParser.json());
    //this.publicApp.use("/photos", qt.static(path.join(__dirname, "../..", "tmp/photos")));
    this.publicApp.get("/super/logout", function(req, res) {
        req.logout();
        res.redirect("/super/login");
    });
    this.publicApp.get("/super/login", function(req, res) {
        res.render("admin/login");
    });

    this.publicApp.post("/super/login", function(req, res, next) {
        return passport.authenticate("local-login", {
            failureRedirect: "/super/login",
            successRedirect: "/super/" + (req.body.hash || "")
        })(req, res, next);
    });
    this.publicApp.get("/super", ensureAuthenticated, function(req, res) {
        res.render("admin/main");
    });
};

WebServer.prototype.setupPublicApp = function() {
    this.publicApp.use(compression());
    // assign the handlebars engine to .handlebars files
    this.publicApp.engine("hbs", hbs.create().express3({
        partialsDir: [
            path.join(__dirname, "../public/views/public/partials"),
            path.join(__dirname, "../public/views/admin/partials")
        ]
    }));
    this.publicApp.disable("x-powered-by");
    // set .handlebars as the default extension
    this.publicApp.set("view engine", "hbs");
    this.publicApp.set("views", path.join(__dirname, "../public/views"));
    this.publicApp.use(function(req, res, next) {
        debugReq("%s %s", req.method, req.url);
        next();
    });
    this.publicApp.use(express.static("bower_components"));
    this.publicApp.use(express.static("app/public/"));
    this.publicApp.use(express.static("app/admin/public/"));
    this.publicApp.use("/views", express.static("app/public/views"));
    this.publicApp.use("/photos", qt.static(path.join(__dirname, "../..", "tmp/photos")));
    this.publicApp.use(bodyParser.urlencoded({
        extended: true
    }));
    this.publicApp.use(bodyParser.json());
    this.publicApp.get("/", function(req, res) {
        res.render("public/index");
    });
    this.publicApp.post("/", function(req, res) {
        console.log("params", req.params);
        console.log("body", req.body);
        console.log("query", req.query);
        res.render("public/index");
    });
};
WebServer.prototype.setupBrokerApp = function() {
    var that = this;
    this.brokerApp.all("*", function(req, res) {
        debug("Trying to connect to admin with broker port");
        debug("Redirect %s:%d", that.config.server.https.admin.hostname, that.config.server.https.admin.port);
        res.redirect(301, "https://" + that.config.server.https.admin.hostname + ":" + that.config.server.https.admin.port);
    });
};

WebServer.prototype.start = function() {
    //var http = require("http");
    var https = require("https");
    var httpsSettings = {
        key: fs.readFileSync(path.join(process.cwd(), this.config.server.https.keys.key)),
        cert: fs.readFileSync(path.join(process.cwd(), this.config.server.https.keys.cert))
    };
    //this.adminApp = express();
    this.publicApp = express();
    this.brokerApp = express();
    //this.adminServer = http.Server(this.adminApp);
    //this.adminServerSecured = https.createServer(httpsSettings, this.adminApp);
    this.publicServerSecured = https.createServer(httpsSettings, this.publicApp);
    this.brokerServerSecured = https.createServer(httpsSettings, this.brokerApp);
    this.setupAdminApp();
    this.setupPublicApp();
    this.setupBrokerApp();

    function start(server, opts) {
        server.listen(opts.port, opts.hostname);
        debug(" - " + opts.message + " started on %s:%d", opts.hostname, opts.port);
    }

    /*    start(this.adminServer, {
        server: this.adminServer,
        port: this.config.server.http.admin.port,
        hostname: this.config.server.http.admin.hostname,
        message: "Admin webserver"
    });*/

    /*start(this.adminServerSecured, {
        port: this.config.server.https.admin.port,
        hostname: this.config.server.https.admin.hostname,
        message: "Admin webserver"
    });*/

    start(this.publicServerSecured, {
        port: this.config.server.https.public.port,
        hostname: this.config.server.https.public.hostname,
        message: "Public and Admin webserver"
    });

    start(this.brokerServerSecured, {
        port: this.config.server.https.broker.port,
        hostname: this.config.server.https.broker.hostname,
        message: "Broker and shooting webserver"
    });

    return this;
};
WebServer.prototype.getAdminApp = function() {
    return this.adminApp;
};
WebServer.prototype.getPublicApp = function() {
    return this.publicApp;
};
WebServer.prototype.getAdminHTTPServer = function() {
    return this.adminServer;
};
WebServer.prototype.getAdminHTTPSServer = function() {
    return this.adminServerSecured;
};
WebServer.prototype.getBrokerHTTPSServer = function() {
    return this.brokerServerSecured;
};
WebServer.prototype.getPublicHTTPSServer = function() {
    return this.publicServerSecured;
};
module.exports = function(settings) {
    return new WebServer(settings);
};
/*module.exports = {
    app: app,
    server: server,
    serverSecured: serverSecured,
    brokerServerSecured: brokerServerSecured
};*/