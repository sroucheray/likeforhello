/*eslint-env amd */
define(["backbone", "app/collections/data"], function(Backbone, DataCollection) {
    "use strict";
    var Statistics = DataCollection.extend({
        backend: "dataBackend",
        model: Backbone.Model.extend({}),
        collName: "statistics"
    });

    return Statistics;
});
