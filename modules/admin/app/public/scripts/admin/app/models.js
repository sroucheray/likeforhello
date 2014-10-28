define([

    "backbone",
    "app/collections/modules",
    "app/collections/photos",
    "app/collections/settings",
    "app/collections/states",
    "app/collections/visitors",
    "app/collections/week",
    "underscore",
    "backbone.io"
], function(
    Backbone,
    ModulesCollection,
    PhotosCollection,
    SettingsCollection,
    StatesCollection,
    VisitorsCollection,
    WeekCollection,
    _
) {
    "use strict";
    var io = Backbone.io.connect();

    var models = {
        collections: {
            modules: new ModulesCollection([], {
                parse: true
            }),
            photos: new PhotosCollection([], {
                parse: true
            }),
            settings: new SettingsCollection([], {
                parse: true
            }),
            states: new StatesCollection([], {
                parse: true
            }),
            visitors: new VisitorsCollection([], {
                parse: true
            }),
            week: new WeekCollection([], {
                parse: true
            })
        }
    };

    function fetchAll() {
        _.each(models.collections, function(collection) {
            collection.fetch();
        });
    }

    function reconnectAll() {
        _.each(models.collections, function(collection) {
            collection.trigger("reconnect");
        });
    }

    function disconnectAll() {
        _.each(models.collections, function(collection) {
            collection.reset();
        });
    }

    io.on("connect", function() {
        console.info("Socket connection");
        //fetchAll();
    });

    io.on("reconnect", function() {
        console.info("Socket reconnection", io);
        window.location.reload();
    });

    io.on("disconnect", function() {
        console.info("Socket disconnection", arguments);
        setTimeout(function() {
            disconnectAll();
            window.alert("Déconnexion du serveur");
        }, 200);
        disconnectAll();
        //models.collections.modules.reset();
    });

    return models;
});