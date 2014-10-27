"use strict";

var crypto = require("crypto"),
    generatePassword = require("password-generator");


function generate(){
    return generatePassword();
}

function hash(password) {
    var sha256 = crypto.createHash("sha256");
    sha256.update(password, "utf8");

    return sha256.digest("base64");
}

function areEquals(password, h) {
    var passwordHash = hash(password);

    return passwordHash === h;
}


module.exports = {
    generate: generate,
    hash : hash,
    areEquals: areEquals
};