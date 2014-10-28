"use strict";
var config = require("./config.json");
var _ = require("underscore");
var moment = require("moment");
module.exports = function(grunt) {
    var gruntConfig = {
        pkg: grunt.file.readJSON("package.json"),
        less: {
            development: {
                options: {
                    paths: ["app/admin/less/"]
                }, // target name
                files: [{
                    // no need for files, the config below should work
                    expand: true,
                    cwd: "app/admin/less/",
                    src: "*.less",
                    ext: ".css",
                    dest: "app/admin/public/styles/"
                }]
            },
            production: {
                options: {
                    paths: ["app/admin/less/"],
                    cleancss: true
                }, // target name
                files: [{
                    // no need for files, the config below should work
                    expand: true,
                    cwd: "app/admin/less/",
                    src: "*.less",
                    ext: ".css",
                    dest: "app/admin/public/styles/"
                }]
            }
        },
        concat_css: {
            options: {
                assetBaseUrl: "/lib",
                baseDir: "bower_components"
            },
            all: {
                src: ["bower_components/bootstrap/dist/css/bootstrap.min.css", "bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css", "app/admin/public/styles/styles.css"],
                dest: "app/public/styles/admin/styles.min.css"
            }
        },
        copy: {},
        requirejs: {
            compile: {
                options: {
                    optimize: "uglify2",
                    preserveLicenseComments: false,
                    generateSourceMaps: true,
                    baseUrl: "app/admin/public/scripts",
                    mainConfigFile: "app/admin/public/scripts/app.js",
                    name: "app/main",
                    out: "app/admin/public/scripts/app.min.js",
                    paths: {
                        "views": "views",
                        "requirejs": "../../../../bower_components/requirejs/require",
                        "hbs": "../../../../bower_components/require-handlebars-plugin/hbs",
                        "jquery": "../../../../bower_components/jquery/dist/jquery.min",
                        "bootstrap": "../../../../bower_components/bootstrap/dist/js/bootstrap.min",
                        "polyfiller": "../../../../bower_components/webshim/js-webshim/minified/polyfiller",
                        "datetime-picker": "../../../../bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker",
                        "moment": "../../../../bower_components/moment/moment",
                        "moment.fr": "../../../../bower_components/moment/locale/fr",
                        "moment-duration-format": "../../../../bower_components/moment-duration-format/lib/moment-duration-format",
                        "underscore": "../../../../bower_components/underscore/underscore",
                        "backbone": "../../../../bower_components/backbone/backbone",
                        "socket.io": "../../../../node_modules/backbone.io/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io",
                        "backbone.io": "lib/backbone.io/backbone.io",
                        "text": "../../../../bower_components/requirejs-plugins/lib/text",
                        "async": "../../../../bower_components/requirejs-plugins/src/async",
                        "font": "../../../../bower_components/requirejs-plugins/src/font",
                        "goog": "../../../../bower_components/requirejs-plugins/src/goog",
                        "image": "../../../../bower_components/requirejs-plugins/src/image",
                        "json": "../../../../bower_components/requirejs-plugins/src/json",
                        "noext": "../../../../bower_components/requirejs-plugins/src/noext"
                    }
                }
            }
        },
        watch: {
            scripts: {
                files: ["**/*.js"],
                tasks: ["less"],
                options: {
                    spawn: false
                }
            }
        }
    };
    //Build copy tree for Arduino sketch from templates
    _.each(config.modules, function(modules, name) {
        if (name === "alert" || name === "button") {
            _.each(modules, function(params, module) {
                var copyParams = {};
                if ("mac" in params) {
                    var folder = "MAC" + params.mac.join("");
                    var file = folder + ".ino";
                    copyParams.src = "../" + name + "/" + name + "_arduino_sketch/" + name + "_arduino_sketch.ino";
                    copyParams.dest = "../" + name + "/" + folder + "/" + file;
                    copyParams.options = {
                        process: function(content) {
                            return grunt.template.process(content, {
                                data: {
                                    mac: "0x" + params.mac.join(", 0x"),
                                    mqttServerIp: params.mqttServerIp.join(", "),
                                    name: module,
                                    date: moment().format("Do MMMM YYYY  HH:mm:ss")
                                }
                            });
                        }
                    };
                    gruntConfig.copy[folder] = copyParams;
                }
            });
        }
    });
    // Project configuration.
    grunt.initConfig(gruntConfig);
    require("load-grunt-tasks")(grunt);
    grunt.registerTask("default", ["less:development", "concat_css"]);
};