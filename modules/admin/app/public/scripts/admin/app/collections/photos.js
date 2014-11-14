/*eslint-env amd */
define(["backbone", "app/collections/data"], function(Backbone, DataCollection) {
    "use strict";
    var Photos = DataCollection.extend({
        backend: "dataBackend",
        model: Backbone.Model.extend({}),
        collName: "photos",
        publishPhoto: function(filename, helloId, callback) {
            this.once("sync", callback);

            this.fetch({
                data: {
                    collName: this.collName,
                    action: "publish",
                    filename: filename,
                    helloId: helloId
                },
                remove: false
            });
        }
    });

    return Photos;
});
