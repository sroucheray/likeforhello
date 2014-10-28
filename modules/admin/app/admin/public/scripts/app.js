/*eslint-env amd*/
/*global requirejs*/
(function() {
    "use strict";

    requirejs.config({
        baseUrl: "/",
        shim: {
            "bootstrap": {
                deps: ["jquery"]
            },
            "underscore": {
                exports: "_"
            },
            "backbone": {
                deps: [
                    "underscore",
                    "jquery"
                ],
                exports: "Backbone"
            },
            "backbone.io": {
                deps: [
                    "socket.io",
                    "backbone"
                ]
            },
            "datetime-picker": {
                deps: [
                    "bootstrap",
                    "moment"
                ]
            },
            "moment-duration-format": {
                deps: [
                    "moment"
                ]
            }
        },
        paths: {
            //"views": "views",
            "requirejs": "../requirejs/require",
            "hbs": "../require-handlebars-plugin/hbs",
            "jquery": "../jquery/dist/jquery.min",
            "bootstrap": "../bootstrap/dist/js/bootstrap.min",
            "polyfiller": "../webshim/js-webshim/minified/polyfiller",
            "datetime-picker": "../eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker",
            "moment": "../moment/moment",
            "moment.fr": "../moment/locale/fr",
            "moment-duration-format": "../moment-duration-format/lib/moment-duration-format",
            "underscore": "../underscore/underscore",
            "backbone": "../backbone/backbone",
            "socket.io": "/socket.io/socket.io",
            "backbone.io": "lib/backbone.io/backbone.io",
            "text": "../requirejs-plugins/lib/text",
            "async": "../requirejs-plugins/src/async",
            "font": "../requirejs-plugins/src/font",
            "goog": "../requirejs-plugins/src/goog",
            "image": "../requirejs-plugins/src/image",
            "json": "../requirejs-plugins/src/json",
            "noext": "../requirejs-plugins/src/noext"
        },
        hbs: {
            helpers: true,
            i18n: false,
            templateExtension: "hbs",
            partialsUrl: "views/admin/partials",
            helperPathCallback: function(name) {
                return "views/admin/helpers/" + name;
            }
        },
        packages: [

        ]
    });
    requirejs(["app/main"]);
})();