"use strict";
module.exports = function(sequelize, DataTypes) {
    var Photo = sequelize.define("Photo", {
        filename: DataTypes.STRING,
        facebook_id: DataTypes.STRING,
        facebook_post_id: DataTypes.STRING,
        shootedAt: DataTypes.DATE,
        published: DataTypes.BOOLEAN,
        publishedAt: DataTypes.DATE
    }, {
        tableName: "Photos",
        classMethods: {
            associate: function(models) {
                Photo.belongsTo(models.Hello);
            }
        }
    });

    return Photo;
};