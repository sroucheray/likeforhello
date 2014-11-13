/*eslint browser:1*/
(function() {
    "use strict";
    var appId = "708032399246642";
    var vvfPageId = "646711455426673";


    function Server(opts) {
        if (!(this instanceof Server)) {
            return new Server(opts);
        }
    }

    Server.prototype.updateUser = function(data, callback) {
        $.post("/user/update" + (window.location.search || ""), data).done(callback);
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
            //$("#review_img").attr("src", "/styles/public/img/message_dattente_facebook_review.png");

            loggedInResponse = response;

            //api([response.authResponse.userID, "permissions"]);

            api([response.authResponse.userID], function(data) {
                userData = data;
                api(["me", "permissions"], function(authData) {
                    var anAuth,
                        hasPublishAction;
                    for(var datum in authData.data){
                        anAuth = authData.data[datum];
                        if(anAuth.permission === "publish_actions" && anAuth.status === "granted"){
                            hasPublishAction = true;
                        }
                    }

                    if(hasPublishAction){
                        $("#facebookModal").modal();
                        userData.auth = authData.data;
                        userData.access_token = loggedInResponse.authResponse.accessToken;

                        $("#publish").one("click", function(){
                            userData.message = $("#message").val();
                            server.updateUser(userData, function(){
                                document.location = "/attente";
                            });
                        })

                    }else{
                        document.location = "/pas-autorisation";
                        console.log("Sorry no publish action");
                    }
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
                scope: "email, publish_actions"
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

        //FB.getLoginStatus(loginStatusHandler);

        $("#defi").click(function(event) {
            event.preventDefault();
            FB.login(loginStatusHandler, {
                scope: "email, publish_actions"
            });
        });

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