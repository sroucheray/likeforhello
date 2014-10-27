"use strict";
var faker = require("faker");
var _ = require("underscore");
var minimist = require("minimist");
var databseClient = require("../app/application/databaseClient");
var uuid = require("node-uuid");

var argv = minimist(process.argv.slice(2));

faker.locale = "fr";

function getTrueOrFalse() {
    return !!(Math.random() < 0.5);
}

if ("create-visitor" in argv) {
    _.times(argv["create-visitor"], function() {
        var first_name = faker.name.firstName(),
            last_name = faker.name.lastName();

        databseClient.createVisitor({
            id: "FAKE" + uuid.v4(),
            name: first_name + " " + last_name,
            first_name: first_name,
            last_name: last_name,
            link: faker.internet.domainName(),
            gender: getTrueOrFalse() ? "male" : "female",
            locale: "fr",
            email: faker.internet.email(),
            hasLiked: getTrueOrFalse(),
            granted_publish_actions: getTrueOrFalse()
        }, function(success) {
            console.log("Visitor created");
        }, function(error) {
            console.log("Error creating visitor", error);

        });
    });
}

if ("addtoqueue" in argv) {
    databseClient.updateQueue(argv["min"] || 0, argv["max"] || 10, function(result) {
        //console.trace("Here I am!")
        console.log("In queue %s visitors : ", result.length)
        _.each(result, function(queue) {
            console.log(" - ", queue.id, " / ", queue.visitors[0].id);
        });
    }, function(error) {
        console.log(error);
    });
}