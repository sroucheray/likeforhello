/*eslint-env amd */
define(["app/collections/data", "app/models/photo"], function(DataCollection, model) {
    "use strict";
    var Photos = DataCollection.extend({
        backend: "dataBackend",
        model: model.Photo,
        collName: "photos",
        numPerLine:5,
        limit: 5
    });

    return Photos;
});