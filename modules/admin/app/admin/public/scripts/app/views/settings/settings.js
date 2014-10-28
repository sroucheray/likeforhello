/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!/views/admin/partials/settings/settings", "app/models/module", "underscore", "backbone", "app/views/utils", "moment", "moment-duration-format"], function(template, moduleModel, _, Backbone, utils, moment) {
    "use strict";
    var SettingsView = utils.ParentView.extend({
        tagName: "div",
        events: {
            "change #isPaused": "changeSetting",
            "change #minRealertDelay": "changeSetting",
            "change #maxRealertDelay": "changeSetting",
            "change #minVisitorQueueLength": "changeSetting",
            "change #maxVisitorQueueLength": "changeSetting",
            "dp.change #startDate": "changeSetting",
            "dp.change #endDate": "changeSetting",
            "click #alertSimulation": "simulateAlert",
            "click #stopAlertSimulation": "stopSimulateAlert",
            "click #checkStatus": "checkStatus"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            this.listenToOnce(this.collection, "sync", this.render);
            this.listenTo(this.collection, "change", this.render);
            this.collection.fetch();
        },
        template: template,
        render: function() {
            var self = this;
            var collection = this.collection.toJSON();
            var viewCollection = {};


            _.each(collection, function(data) {
                if (data.id) {
                    viewCollection[data.id] = data.value;
                }
            });

            this.$el.html(this.template(viewCollection));
            $(".bootstrap-datetimepicker-widget").remove();

            //setTimeout(function() {
            self.$el.find(".time-control").datetimepicker({
                language: "fr",
                sideBySide: true,
                dateFormat: "[Le] dddd DD MM YYYY [à] HH:mm"
            });

            self.$el.find(".delay-control").datetimepicker({
                language: "fr",
                sideBySide: true,
                dateFormat: "m [minutes] s [secondes]",
                pickDate: false,
                useMinutes: true, //en/disables the minutes picker
                useSeconds: true
            });

            self.delegateChangeTimeEvent = true;
            self.updateDuration();
            //}, 0);

            return this;
        },
        updateDuration: function() {
            var $duration = this.$("#duration"),
                $minRealertDelay = this.$("#minRealertDelay"),
                $maxRealertDelay = this.$("#maxRealertDelay"),
                startDate = this.$("#startDate").data("DateTimePicker").getDate(),
                endDate = this.$("#endDate").data("DateTimePicker").getDate();

            startDate = moment(startDate);
            endDate = moment(endDate);

            $duration.html(moment.duration(endDate.diff(startDate)).format("d [jours] et h [heures]"));


            $minRealertDelay.parents(".input-group").siblings("small").find("output").html(this.getMilliseconds($minRealertDelay) + " ms");
            $maxRealertDelay.parents(".input-group").siblings("small").find("output").html(this.getMilliseconds($maxRealertDelay) + " ms");

        },
        getMilliseconds: function(target) {
            return 1000 * (this.$(target).data("DateTimePicker").getDate().minutes() * 60 + this.$(target).data("DateTimePicker").getDate().seconds());
        },
        changeSetting: function(event) {
            var id = event.target.id;
            var value = id === "isPaused" ? this.$(event.target).is(":checked") : this.$(event.target).val();
            var $max;

            if (id === "minRealertDelay" || id === "maxRealertDelay") {
                value = this.getMilliseconds(event.target);
            }

            if (id === "minVisitorQueueLength") {
                $max = this.$("#maxVisitorQueueLength");
                $max.attr("min", value);
            }


            if (id === "maxVisitorQueueLength") {
                $max = this.$("#minVisitorQueueLength");
                $max.attr("max", value);
            }

            if (id === "startDate" || id === "endDate") {
                value = this.$(event.target).data("DateTimePicker").getDate().valueOf();
            }

            this.collection.get(id).save({
                "value": value
            });

            this.updateDuration();
        },
        simulateAlert: function() {
            this.collection.simulateAlert();
        },
        stopSimulateAlert: function() {
            this.collection.stopSimulateAlert();
        },
        checkStatus: function() {
            this.collection.checkStatus();
        }
    });

    return SettingsView;
});