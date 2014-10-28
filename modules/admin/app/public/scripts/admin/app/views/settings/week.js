/*eslint-env amd*/
/*eslint camelcase:0*/
define(["hbs!/views/admin/partials/settings/week", "underscore", "backbone", "app/views/utils", "datetime-picker"], function(template, _, Backbone, utils) {
    "use strict";
    var WeekView = utils.ParentView.extend({
        tagName: "div",
        events: {
            "change .time-enabled": "enable",
            'dp.change input[type="time"]': "changeTime"
        },
        initialize: function() {
            utils.ParentView.prototype.initialize.apply(this, arguments);
            this.listenToOnce(this.collection, "sync", this.render);
            this.listenToOnce(this.collection, "update", this.render);
            this.collection.fetch();
        },
        template: template,
        render: function() {
            var self = this;
            var collection = this.collection.toJSON();
            var viewCollection = {};
            this.delegateChangeTimeEvent = false;

            _.each(collection, function(data) {
                if ("day_of_week" in data) {
                    viewCollection[data.day_of_week] = data;
                }
            });

            this.$el.html(this.template(viewCollection));

            setTimeout(function() {
                self.$el.find(".time-control").datetimepicker({
                    language: "fr",
                    pickDate: false
                });
                /*self.$el.find(".time-control").timepicker({
                    minuteStep: 10,
                    showMeridian: false
                });*/

                self.delegateChangeTimeEvent = true;
            }, 0);

            return this;
        },
        enable: function(event) {
            var $checkBox = this.$(event.target),
                $group = $checkBox.parents(".form-group"),
                $inputs = $group.find('input[type="time"]'),
                enabled = $checkBox.prop("checked"),
                day = this.collection.get($group.data("day"));

            $inputs.prop("disabled", !enabled);
            if(enabled){
                $inputs.datetimepicker({
                    language: "fr",
                    pickDate: false
                });
            }

            day.save({
                enabled: enabled
            }, {
                merge: true
            });
        },
        changeTime: function(event) {
            if (this.delegateChangeTimeEvent) {
                var hours = event.date.get("hour"),
                    minutes = event.date.get("minute"),
                    $input = this.$(event.target),
                    $group = this.$(event.target).parents(".form-group"),
                    day = this.collection.get($group.data("day"));

                if ($input.hasClass("ouverture")) {
                    day.save({
                        open_hour: hours,
                        open_minute: minutes
                    }, {
                        merge: true
                    });
                } else if ($input.hasClass("fermeture")) {
                    day.save({
                        close_hour: hours,
                        close_minute: minutes
                    }, {
                        merge: true
                    });
                }
            }
        }
    });

    return WeekView;
});