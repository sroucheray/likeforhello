/*eslint-env amd */
define(["backbone", "app/collections/data"], function(Backbone, DataCollection) {
    "use strict";
    var Visitors = DataCollection.extend({
        backend: "dataBackend",
        model: Backbone.Model.extend({}),
        collName: "visitors",
        publishPhotoOnWall: function(filename, visitorId, callback) {
            this.once("sync", callback);

            this.fetch({
                data: {
                    collName: this.collName,
                    action: "publishOnWall",
                    filename: filename,
                    visitorId: visitorId
                },
                remove: false
            });
        }
    });

    return Visitors;
});
