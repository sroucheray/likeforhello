"use strict";
module.exports = function(sequelize, DataTypes) {
    var Visitor = sequelize.define("Visitor", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        name: DataTypes.STRING,
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        link: DataTypes.STRING,
        gender: DataTypes.STRING,
        locale: DataTypes.STRING,
        email: DataTypes.STRING,
        hasLiked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        granted_publish_actions: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        access_token: DataTypes.STRING,
        expanded_access_token: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Visitor.belongsTo(models.Hello);
                Visitor.belongsTo(models.Queue);
            }
        }
    });

    return Visitor;
};