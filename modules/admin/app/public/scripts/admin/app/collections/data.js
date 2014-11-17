/*eslint-env amd */
define(["underscore", "backbone", "moment", "backbone.io"], function(_, Backbone, moment) {
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
        getDataByDate: function(startDate, endDate, callback) {
            var that = this,
                startDateTime = startDate.getTime(),
                endDateTime = endDate.getTime();

            function deliver() {
                var jsonData = that.toJSON();

                this.minDate = moment(that.min(function(item) {
                    return moment(item.createdAt).valueOf();
                }).createdAt).valueOf();

                this.maxDate = moment(that.max(function(item) {
                    return moment(item.createdAt).valueOf();
                }).createdAt).valueOf();

                if (typeof that.filterFunc === "function") {
                    jsonData = _.filter(jsonData, that.filterFunc);
                }

                callback.call(that, _.filter(jsonData, function(item) {
                    var dateTime = moment(item.createdAt).valueOf();

                    return dateTime >= startDateTime && dateTime <= endDateTime;
                }));
            }

            if (startDateTime >= this.minDate && endDateTime <= this.maxDate) {
                deliver();
                return;
            }

            this.once("sync", deliver);

            this.fetch({
                data: {
                    collName: this.collName,
                    startDate: startDate.getTime(),
                    endDate: endDate.getTime()
                },
                remove: false
            });
        },
        getAllData: function(callback, remove) {
            var that = this;

            function deliver() {
                var jsonData = that.toJSON();

                if (typeof that.filterFunc === "function") {
                    jsonData = _.filter(jsonData, that.filterFunc);
                }

                callback.call(that, jsonData);
            }

            this.once("sync", deliver);

            this.fetch({
                data: {
                    collName: this.collName
                },
                remove: remove
            });
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