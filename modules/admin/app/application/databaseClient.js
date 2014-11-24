"use strict";

var sqlClient = require("./db/sqlClient");
var password = require("./db/password");
var _ = sqlClient.Sequelize.Utils._;
var dbProperties = ["createdAt", "updatedAt"];
var dbPropertiesWithId = ["createdAt", "updatedAt", "id"];
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
    debug("Setup authentication method");
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
        return this.getPhotos(options.data.startDate, options.data.endDate);
    }

    if (options.data.collName === "visitors") {
        return this.getVisitors(options.data.startDate, options.data.endDate);
    }

    if (options.data.collName === "visits") {
        return this.getVisitsStats(options.data.startDate, options.data.endDate);
    }

    if (options.data.collName === "statistics") {
        return this.getOperationStats();
    }

    var deffer = q.deferred();

    deffer.reject("Can't get data for unknown collName");

    return deffer.promise;
};

DataBaseClient.prototype.getPhotos = function(startDate, endDate) {
    debug("Get photos between %s and %s", startDate, endDate);
    return sqlClient.Photo.findAll({
        order: "shootedAt DESC",
        where: {
            createdAt: {
                between: [new Date(startDate), new Date(endDate)]
            }
        }
    }, {
        raw: true
    });
};


DataBaseClient.prototype.getLastPhotos = function(num) {
    num = num || 100;
    debug("Get last %s photos", num);
    return sqlClient.Photo.findAll({
        order: "shootedAt DESC",
        limit: num
    }, {
        raw: true
    });
};

DataBaseClient.prototype.getVisitors = function(startDate, endDate) {
    debug("Get visitors between %s and %s", startDate, endDate);
    return sqlClient.Visitor.findAll({
        order: "createdAt DESC",
        where: {
            createdAt: {
                between: [new Date(startDate), new Date(endDate)]
            }
        },
        include: [{
            model: sqlClient.Hello,
            include: [{
                model: sqlClient.Photo
            }]
        }]
    }, {
        raw: true
    });
};

DataBaseClient.prototype.getVisitor = function(id, notRaw) {
    debug("Get visitor : %s", id);
    return sqlClient.Visitor.find(id, {
        raw: notRaw ? false : true
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

DataBaseClient.prototype.getFullVisitor = function(id) {
    debug("Get visitor : %s", id);
    return sqlClient.Visitor.findAll({
        where: {
            id: id
        },
        include: [{
            model: sqlClient.Hello,
            include: [{
                model: sqlClient.Photo
            }]
        }]
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
    debug("Update photo with hello %s with post %s", helloId, postId);
    return sqlClient.Hello.find(helloId).then(function(hello) {
        return hello.getPhotos();
    }).then(function(photo) {
        if (!photo) {
            throw new Error("No photo attached to hello " + helloId);
        }

        return photo.updateAttributes({
            facebook_post_id: postId
        }, ["facebook_post_id"]);

    });
};

DataBaseClient.prototype.getOperationStats = function() {
    return sqlClient.sequelize.query("SELECT DATE_FORMAT(`createdAt`, '%Y-%m-%d')as id, sum(case when `camera`= \"cam_ground\" then 1 else 0 end) as \"Rez-de-Chaussée\", sum(case when `camera`= \"cam_1stfloor\" then 1 else 0 end) as \"1er étage\", sum(case when `camera`= \"cam_2ndfloor\" then 1 else 0 end) as \"2ème étage\", sum(case when `button`= 1 then 1 else 0 end) as \"Equipe A\", sum(case when `button`= 2 then 1 else 0 end) as \"Equipe B\", sum(case when `button`= 3 then 1 else 0 end) as \"Equipe C\", DATE_FORMAT(`createdAt`, '%Y-%m-%d') AS `Jour` FROM `Hellos` WHERE 1 GROUP BY `Jour` ORDER BY `createdAt` ASC");
};

DataBaseClient.prototype.getVisitsStats = function(startDate, endDate) {
    return sqlClient.sequelize.query("SELECT DATE_FORMAT(`createdAt`, \"%Y-%m-%dT%H:00\") as `Hour`, count(`id`) as `Visitors` FROM `Visitors` WHERE 1 GROUP BY `Hour` ORDER BY `createdAt` ASC");
};





/*SELECT
DATE_FORMAT(`createdAt`, '%Y-%m-%d')as id,
sum(case when `camera`= "camera_ground" then 1 else 0 end) as "Rez-de-Chaussée",
sum(case when `camera`= "cam_1stfloor" then 1 else 0 end) as "1er étage",
sum(case when `camera`= "cam_2ndfloor" then 1 else 0 end) as "2ème étage",
sum(case when `button`= 1 then 1 else 0 end) as "Equipe A",
sum(case when `button`= 2 then 1 else 0 end) as "Equipe B",
sum(case when `button`= 3 then 1 else 0 end) as "Equipe C",
DATE_FORMAT(`createdAt`, '%Y-%m-%d') AS `Jour`
FROM `Hellos`
WHERE 1
GROUP BY `Jour` ORDER BY `createdAt` ASC*/

module.exports = new DataBaseClient();