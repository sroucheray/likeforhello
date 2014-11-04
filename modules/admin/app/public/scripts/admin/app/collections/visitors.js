/*eslint-env amd */
define(["app/collections/data", "app/models/visitor"], function(DataCollection, model) {
    "use strict";
    var Visitors = DataCollection.extend({
        backend: "dataBackend",
        model: model.Visitor,
        collName: "visitors"
    });

    return Visitors;
});
