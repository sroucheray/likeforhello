"use strict";
module.exports = function(sequelize, DataTypes) {
    var Queue = sequelize.define("Queue", {
    }, {
        tableName: "Queue",
        classMethods: {
            associate: function(models) {
                Queue.hasMany(models.Visitor);
            }
        }
    });

    return Queue;
};