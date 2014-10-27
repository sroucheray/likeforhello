"use strict";
module.exports = function(sequelize, DataTypes) {
    var Hello = sequelize.define("Hello", {
        camera: DataTypes.ENUM("cam_ground", "cam_1stfloor", "cam_2ndfloor"),
        button: DataTypes.ENUM("1", "2", "3"),
        answered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        answeredAt: DataTypes.DATE
    }, {
        tableName: "Hellos",
        classMethods: {
            associate: function(models) {
                Hello.hasMany(models.Visitor);
                Hello.hasOne(models.Photo);
            }
        }
    });

    return Hello;
};