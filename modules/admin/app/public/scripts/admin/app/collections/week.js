/*eslint-env amd */
define(["underscore", "backbone", "backbone.io"], function(_, Backbone) {
    "use strict";
    var Week = Backbone.Collection.extend({
        backend: "settingsBackend",
        model: Backbone.Model.extend({}),
        initialize: function() {
            var self = this;

/*            this.bind("backend:create", function(data) {
                console.log("create settings", data)

                self.add(data, {
                    merge: true
                });
            });

            this.bind("backend:update", function(data) {
                console.log("update settings")
                var setting = self.get(data.id).set(data);
                if (setting) {
                    setting.set(data);
                } else {
                    self.add(data, {
                        merge: true
                    });
                }
            });*/

/*            this.bind("backend:delete", function(data) {
                self.remove(data.id);
            });*/

            this.bind("sync", function(col, data) {
                _.each(data.timetable, function(day) {
                    day.id = day.day_of_week;
                    self.add(day, {
                        merge: true
                    });
                });
            });

        }
    });

    return Week;
});
