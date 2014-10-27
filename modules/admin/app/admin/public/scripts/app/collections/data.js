/*eslint-env amd */
define(["underscore", "backbone", "backbone.io"], function(_, Backbone) {
    "use strict";
    var wrapError = function(model, options) {
        var error = options.error;
        options.error = function(resp) {
            if (error) {
                error(model, resp, options);
            }
            model.trigger("error", model, resp, options);
        };
    };

    var DataCollection = Backbone.Collection.extend({
        backend: "dataBackend",
        offset: 0,
        limit: 20,
        collName: null,
        fetch: function(options) {
            if (!options.data || options.data.collName !== this.collName) {
                console.log("This fetch is not for this collection");
                return "This fetch is not for this collection";
            }

            options = options ? _.clone(options) : {};
            if (options.parse === void 0) {
                options.parse = true;
            }
            var success = options.success;
            var collection = this;
            options.success = function(resp) {
                var method = options.reset ? "reset" : "set";
                collection[method](resp, options);
                if (success) {
                    success(collection, resp, options);
                }
                collection.trigger("sync", collection, resp, options);
            };
            wrapError(this, options);
            return this.sync("read", this, options);
        },
        initialize: function() {
            if (!this.collName) {
                throw "Must define a collName property to this collection";
            }

            this.page = this.page || 0;

        },
        getFiltered: function(offset, limit) {
            return _.filter(this.toJSON(), function(item, index) {
                return index >= offset && index < offset + limit;
            });
        },
        getPage: function(pageNum, callback) {
            var self = this;
            var offset = pageNum * this.limit;
            if (this.length > offset + this.limit) {
                callback.call(this, this.getFiltered(offset, this.limit));

                return;
            }

            this.once("sync", function() {

                callback.call(self, self.getFiltered(offset, self.limit));
            });

            this.fetch({
                data: {
                    collName: this.collName,
                    offset: offset,
                    limit: this.limit
                },
                remove: false
            });
        }
    });

    return DataCollection;
});