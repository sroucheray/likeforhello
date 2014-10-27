"use strict";
module.exports = function(sequelize, DataTypes) {
    var Timetable = sequelize.define("Timetable", {
        day_of_week: DataTypes.INTEGER, //0 : Sunday , 1 Monday...
        open_hour: DataTypes.INTEGER,
        open_minute: DataTypes.INTEGER,
        close_hour: DataTypes.INTEGER,
        close_minute: DataTypes.INTEGER,
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: "Timetable",
        classMethods: {
            associate: function(models) {}
        }
    });

    return Timetable;
};