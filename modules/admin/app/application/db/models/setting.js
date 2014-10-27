"use strict";
module.exports = function(sequelize, DataTypes) {
    var Setting = sequelize.define("Setting", {
        name: DataTypes.STRING,
        value: DataTypes.STRING,
        default: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
            }
        }
    });

    return Setting;
};