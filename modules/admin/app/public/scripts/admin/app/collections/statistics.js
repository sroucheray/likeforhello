/*eslint-env amd */
define(["app/collections/data", "app/models/statistic"], function(DataCollection, model) {
    "use strict";
    var Statistics = DataCollection.extend({
        backend: "dataBackend",
        model: model.Statistics,
        collName: "statistics"
    });

    return Statistics;
});
