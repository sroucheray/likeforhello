/*eslint-env amd */
define(["backbone", "app/collections/data"], function(Backbone, DataCollection) {
    "use strict";
    var Photos = DataCollection.extend({
        backend: "dataBackend",
        model: Backbone.Model.extend({}),
        collName: "photos"
    });

    return Photos;
});
