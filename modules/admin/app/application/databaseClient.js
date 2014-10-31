"use strict";
var sqlClient = require("./db/sqlClient");
var password = require("./db/password");
var _ = sqlClient.Sequelize.Utils._;
var settings = null;
var dbProperties = ["createdAt", "updatedAt"];
var dbPropertiesWithId = ["createdAt", "updatedAt", "id"];
var callbacks = {};
var EventEmitter = require("events").EventEmitter;
var debug = require("debug")("admin:databaseclient");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var q = require("q");

function omit(values, omit) {
    return _.omit(values, omit);
}

function omitDatabaseProperty(values, keepIndex) {
    return omit(values, keepIndex ? dbProperties : dbPropertiesWithId);
}

function DataBaseClient() {
    debug("Setup authentication method")
    passport.use("local-login", new LocalStrategy(
        function(username, pwd, done) {
            sqlClient.User.find({
                where: {
                    name: username
                }
            }).success(function(user) {
                if (!user) {
                    debug("Auhtentication trial, unknown user %s", username);
                    return done(null, false, {
                        message: "Unknown user " + username
                    });
                }

                if (!password.areEquals(pwd, user.password)) {
                    debug("Auhtentication trial, invalid password %s", username);
                    return done(null, false, {
                        message: "Invalid password"
                    });
                }

                debug("Auhtentication success %s", username);

                return done(null, user);
            }).error(function(error) {
                debug("Authentication error", error);
                return done(error);
            });

        }));

    passport.serializeUser(function(user, done) {
        if (user) {
            return done(null, user.id);
        }
    });

    passport.deserializeUser(function(id, done) {
        sqlClient.User.find(id).success(function(user) {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        }).error(function(error) {
            return done(error);
        });
    });
}


require("util").inherits(DataBaseClient, EventEmitter);

DataBaseClient.prototype.getAllSettings = function() {
    var Setting = sqlClient.Setting;
    var Timetable = sqlClient.Timetable;
    var raw = {
        raw: true
    };
    var result = {};

    return Setting.findAll({
        attributes: [
            ["name", "id"],
            "value"
        ]
    }, raw).then(function(settings) {
        result.settings = settings;

        return Timetable.findAll({
            attributes: [
                "day_of_week",
                "open_hour",
                "open_minute",
                "close_hour",
                "close_minute",
                "enabled"
            ]
        }, raw);
    }).then(function(timetable) {
        result.timetable = timetable;

        return result;
    });
};

DataBaseClient.prototype.updateDay = function(dayModel) {
    var self = this;
    return sqlClient.Timetable.update(omitDatabaseProperty(dayModel), {
        "day_of_week": dayModel.day_of_week
    }).then(function() {
        return self.getAllSettings();
    }).then(function(settings) {
        self.emit("settingsUpdate", settings);

        return settings;
    });
};

DataBaseClient.prototype.updateSetting = function(setting /*, success, error*/ ) {
    var self = this;
    /*var self = this;
    sqlClient.Setting.update(omitDatabaseProperty(setting, false), {
        "name": setting.id
    }).success(function() {
        success.call(this);
        self.getAllSettings(function(data) {
            self.emit("settingsUpdate", data);
        });
    }).error(error);*/

    return sqlClient.Setting.update(omitDatabaseProperty(setting, false), {
        "name": setting.id
    }).then(function() {
        return self.getAllSettings();
    }).then(function(data) {
        self.emit("settingsUpdate", data);
        return data;
    });
};

DataBaseClient.prototype.createVisitor = function(data, success, error) {
    var Visitor = sqlClient.Visitor;

    if (data.id) {
        Visitor.findOrCreate({
            id: data.id
        }, data).success(function(user, created) {
            if (!created) {
                user.updateAttributes(data).success(success).error(error);

                return;
            }

            success(user, created);
        }).error(error);

        return;
    }

    error("Must provide an id to create a new Visitor");
};

DataBaseClient.prototype.getNotGreetedVisitors = function(limit) {
    return sqlClient.Visitor.findAll({
        where: {
            HellosId: null,
            QueueId: null
        },
        limit: limit,
        order: "createdAt ASC"
    });
};

DataBaseClient.prototype.getExceedingVisitorsInQueue = function(max) {
    return sqlClient.Visitor.findAll({
        offset: max,
        where: {
            QueueId: {
                ne: null
            }
        },
        order: "createdAt ASC"
    });
};

DataBaseClient.prototype.updateQueue = function(min, max) {
    var self = this,
        addRemoveNone = "none";

    return sqlClient.Queue.findAndCountAll({
        include: [sqlClient.Visitor]
    }).then(function(result) {
        var numInQueue = result.count,
            visitorToAdd = 0;

        debug("Current number of visitors in Queue : %s (min=%s ; max=%s)", numInQueue, min, max);
        if (numInQueue < max) {
            visitorToAdd = max - numInQueue;
            addRemoveNone = "add";
            return self.getNotGreetedVisitors(visitorToAdd);
        }

        if (numInQueue > max) {
            addRemoveNone = "remove";
            return self.getExceedingVisitorsInQueue(max);
        }

        return result.rows;
    }).then(function(result) {
        if (addRemoveNone === "add") {
            debug("Add %s visitors to the queue list", result.length);
            return _.map(result, function(visitor) {
                //debug("Add one more");
                return visitor.createQueue();
            });
        }

        if (addRemoveNone === "remove") {
            debug("Remove %s visitors from the queue list", result.length);
            return _.map(result, function(visitor) {

                return visitor.getQueue().then(function(queue) {
                    //debug("Remove one more");
                    queue.destroy();
                    return visitor.setQueue(null);
                });
            });
        }

        return result;
    }).spread(function() {
        //console.log("Fetch queue")
        return sqlClient.Queue.findAll({
            include: [sqlClient.Visitor]
        });
    });
};


DataBaseClient.prototype.sayHello = function(data) {
    var visitors = [];
    var theHello;

    debug("Say hello");
    debug(data);

    return sqlClient.Hello.create().then(function(hello) {
        theHello = hello;
        return sqlClient.Queue.findAll({
            include: [sqlClient.Visitor]
        });
    }).then(function(queues) {
        var promises = [];
        debug("Found %s queues", queues.length);

        _.each(queues, function(queue) {
            debug("Found %s visitors in this queue", queue.visitors.length);
            _.each(queue.visitors, function(visitor) {
                debug("Remove visitor %s from queue %s", visitor.id, queue.id);
                promises.push(visitor.setQueue(null));
                debug("Set hello %s to visitor %s", theHello.id, visitor.id);
                promises.push(visitor.setHello(theHello));
                visitors.push(visitor);
            });


            debug("Destroying queue %s", queue.id);
            promises.push(queue.destroy());
        });

        debug("Say hello to %s visitors", visitors.length);

        return promises;
    }).spread(function() {

        debug("Update hello attributes camera %s, button %s", data.camera, data.buttonId);

        var attributes = {
            camera: data.camera,
            button: (parseInt(data.buttonId, 10) + 1) + "",
            answered: true,
            answeredAt: Date.now()
        };
        debug(attributes);
        return theHello.updateAttributes(attributes);
    }).then(function() {
        return theHello;
    });
};

DataBaseClient.prototype.updateHelloWithPhoto = function(id, data) {
    debug("Update hello id `%s` with photo %s", id, data.filename);
    var theHello;
    return sqlClient.Hello.find(id).then(function(hello) {
        if (!hello) {
            debug("Hello %s does not exist", id);

            return false;
        }

        theHello = hello;
        debug("Add photo to database");
        debug(data);

        return theHello.createPhotos(data, {
            fields: ["filename", "shootedAt"]
        });
    });
};

DataBaseClient.prototype.createOrphanPhoto = function(data) {
    return sqlClient.Photo.create(data, {
        fields: ["filename", "shootedAt"]
    });
};

DataBaseClient.prototype.getData = function(options) {
    if (options.data.collName === "photos") {
        return this.getPhotos(options.data.offset, options.data.limit);
    }

    if (options.data.collName === "visitors") {
        return this.getVisitors(options.data.offset, options.data.limit);
    }

    var deffer = q.deferred();

    deffer.reject("Can't get data for unknown collName");

    return deffer.promise;
};

DataBaseClient.prototype.getPhotos = function(offset, limit) {
    debug("Get photos : offset %s, limit %s", offset, limit);
    return sqlClient.Photo.findAll({
        order: "shootedAt DESC",
        offset: offset,
        limit: limit
    }, {
        raw: true
    });
};

DataBaseClient.prototype.getVisitors = function(offset, limit) {
    debug("Get visitors : offset %s, limit %s", offset, limit);
    return sqlClient.Visitor.findAll({
        order: "createdAt DESC",
        offset: offset,
        limit: limit
    }, {
        raw: true
    });
};

DataBaseClient.prototype.getVisitorsWithHello = function(helloId) {
    debug("Get visitors with hello offset %s", helloId);
    return sqlClient.Visitor.findAll({
        order: "createdAt DESC",
        where: {
            HellosId: helloId
        }
    }, {
        raw: true
    });
};

DataBaseClient.prototype.updateVisitorWithPost = function(visitorId, postId) {
    debug("Update visitor %s with post %s", visitorId, postId);

    return sqlClient.Visitor.find(visitorId).success(function(visitor) {
        return visitor.updateAttributes({
            facebook_post_id: postId
        }, ["facebook_post_id"]);
    });
};

DataBaseClient.prototype.updatePhotoWithPost = function(helloId, postId) {
    return sqlClient.Photos.findAll({
        order: "createdAt DESC",
        where: {
            HellosId: helloId
        }
    }).success(function(photo){
        return photo.updateAttributes({
            facebook_post_id: postId
        }, ["facebook_post_id"]);
    });
};

module.exports = new DataBaseClient();