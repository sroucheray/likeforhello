/*eslint-env amd */
define(["app/collections/data", "app/models/photo"], function(DataCollection, model) {
    "use strict";
    var Photos = DataCollection.extend({
        backend: "dataBackend",
        model: model.Photo,
        collName: "photos"
    });

    return Photos;
});
