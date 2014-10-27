"use strict";

var fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    Sequelize = require("sequelize"),
    config = require("../../../config.json"),
    debug = require("debug")("admin:mysql"),
    password = require("./password"),
    minimist = require("minimist");

var sequelize = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
    dialect: "mysql",
    host: config.mysql.host,
    port: config.mysql.port,
    logging: true
});
var db = {};
var modelsBasePath = path.join(__dirname, "models");
var argv = minimist(process.argv.slice(2));

fs.readdirSync(modelsBasePath)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(modelsBasePath, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

sequelize.authenticate().complete(function(err) {
    if (err) {
        debug("Unable to connect to the database");
        debug(err);
        process.exit(1);

        return;
    }

    debug("Connection has been established successfully.");
});

sequelize.sync({
    force: ("force-sync" in argv)
}).complete(function(err) {
    if (err) {
        debug("Unable to sync database");
        debug(err);
        process.exit(1);

        return;
    }

    debug("Database synced.");

    if ("force-sync" in argv) {

        var defaultSettings = _.map(config.settings.defaults, function(value, key) {
            return {
                name: key,
                value: value,
                default: value
            };
        });

        db.Setting.bulkCreate(defaultSettings).success(function() {
            console.log("Reset settings to their defaults");
        }).error(function(err) {
            console.warning("Error resetting settings to their defaults");
            console.error(err);
        });

        db.Timetable.bulkCreate(config.settings.timetable).success(function() {
            console.log("Reset timetable to its defaults");
        }).error(function(err) {
            console.warning("Error resetting timetable to its defaults");
            console.error(err);
        });
    }
});



(function() {
    var username,
        pwd,
        pwdHash;

    if ("create-user" in argv) {
        username = argv["create-user"];

        if ("password" in argv) {
            pwd = argv["password"];
        } else {
            pwd = password.generate();
        }

        pwdHash = password.hash(pwd);

        db.User.findOrCreate({
            name: username
        }, {
            password: pwdHash,
            email: argv["email"] || null
        }).success(function(user, wasCreated) {
            if (!wasCreated) {
                console.log("User %s already exists", user.name);
                return;
            }

            console.log("User created : ");
            console.log(" name :\t" + user.name);
            console.log(" pwd :\t" + pwd);
        }).error(function(error) {
            console.error("User not created");
            console.error(error);
        });
    }

})();

module.exports = _.extend({
    sequelize: sequelize,
    Sequelize: Sequelize
}, db);