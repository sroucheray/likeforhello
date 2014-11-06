/*eslint-env amd*/
/*global requirejs*/
(function() {
    "use strict";

    requirejs.config({
        //base:"https://fb.byperiscope.com/hello/likeforhello/modules/admin/app/public/scripts/admin",
        waitSeconds: 0,
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
            "views": "../../views",
            "requirejs": "/lib/requirejs/require",
            "hbs": "/lib/require-handlebars-plugin/hbs",
            "jquery": "/lib/jquery/dist/jquery.min",
            "bootstrap": "/lib/bootstrap/dist/js/bootstrap.min",
            "polyfiller": "/lib/webshim/js-webshim/minified/polyfiller",
            "datetime-picker": "/lib/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker",
            "moment": "/lib/moment/moment",
            "moment.fr": "/lib/moment/locale/fr",
            "moment-duration-format": "/lib/moment-duration-format/lib/moment-duration-format",
            "underscore": "/lib/underscore/underscore",
            "backbone": "/lib/backbone/backbone",
            "socket.io": "/socket.io/socket.io",
            "backbone.io": "lib/backbone.io/backbone.io",
            "text": "/lib/requirejs-plugins/lib/text",
            "async": "/lib/requirejs-plugins/src/async",
            "font": "/lib/requirejs-plugins/src/font",
            "goog": "/lib/requirejs-plugins/src/goog",
            "propertyParser": "/lib/requirejs-plugins/src/propertyParser",
            "image": "/lib/requirejs-plugins/src/image",
            "json": "/lib/requirejs-plugins/src/json",
            "noext": "/lib/requirejs-plugins/src/noext"
        },
        hbs: {
            helpers: true,
            i18n: false,
            templateExtension: "hbs",
            partialsUrl: "../../views/admin/partials",
            helperPathCallback: function(name) {
                return  "helpers/" + name;
            }
        },
        packages: [

        ]
    });
    requirejs(["app/main"]);
})();
