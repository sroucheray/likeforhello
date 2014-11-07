/*eslint-env amd */
define(["backbone", "app/collections/data"], function(Backbone, DataCollection) {
    "use strict";
    var Visits = DataCollection.extend({
        backend: "dataBackend",
        model: Backbone.Model.extend({}),
        collName: "visits"
    });

    return Visits;
});
