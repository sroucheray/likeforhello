/*eslint browser:1*/
(function() {
    "use strict";
    var appId = "708032399246642";
    var vvfPageId = "194889667305745";


    function Server(opts) {
        if (!(this instanceof Server)) {
            return new Server(opts);
        }
    }

    Server.prototype.updateUser = function(data) {
        $.post("/user/update" + (window.location.search || ""), data);
    };

    var server = new Server();

    window.fbAsyncInit = function() {
        var loggedInResponse,
            userData;

        FB.init({
            appId: appId,
            xfbml: true,
            version: "v2.1"
        });

        function api(pathArray, callback) {
            var path = "/" + pathArray.join("/");
            FB.api(path, function(data) {
                console.log("Calling", path);
                console.log("Getting", data);
                if (typeof callback === "function") {
                    callback.call(this, data);
                }
            });
        }

        function isLoggedIn(response) {
            console.log(response);
            loggedInResponse = response;

            //api([response.authResponse.userID, "permissions"]);

            api([response.authResponse.userID], function(data) {
                userData = data;
                api(["me", "permissions"], function(authData) {
                    userData.auth = authData.data;
                    userData.access_token = loggedInResponse.authResponse.accessToken
                    server.updateUser(userData);
                });
                /*var welcomeBlock = document.getElementById("fb-welcome");
                welcomeBlock.innerHTML = "Hello, " + data.first_name + "!";*/
            });

            //api([response.authResponse.userID, "likes", vvfPageId]);
        }

        function isLoggedOut() {
            /*var welcomeBlock = document.getElementById("fb-welcome");
            welcomeBlock.innerHTML = "Please log in to our Facebook app!";*/
            FB.login(loginStatusHandler, {
                scope: "email, publish_actions, user_photos"
            });
        }


        function loginStatusHandler(response) {
            if (response.status == "connected" && response.authResponse && response.authResponse.userID) {
                isLoggedIn(response);
                return;
            }

            isLoggedOut();
        }

        function likeHandler(url, html_element) {
            console.log("Like");
        }

        function unlikeHandler(url, html_element) {
            console.log("Unlike");
        }

        window.loginButtonPushed = function() {
            FB.getLoginStatus(loginStatusHandler);
        };

        FB.getLoginStatus(loginStatusHandler);

        $("#bonjour").click(function(event) {
            event.preventDefault();
            FB.login(loginStatusHandler, {
                scope: "email, publish_actions"
            });
        }).hide();

        $("#logout").click(function(event) {
            event.preventDefault();
            FB.logout(function(response) {
                console.log("Logged out")
            });
        });

        // In your onload handler
        FB.Event.subscribe("edge.create", likeHandler);
        FB.Event.subscribe("edge.remove", unlikeHandler);
    };
})();


(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/fr_FR/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, "script", "facebook-jssdk"));