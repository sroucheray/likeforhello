var page = require('webpage').create();
var fs = require('fs');

page.onConsoleMessage = function(msg) {
    console.log("PAGE >", msg);
};

function grab() {
    page.open('https://www.facebook.com/browse/page_fans/?page_id=194889667305745', function() {
        var total = 0;
        page.evaluate(function() {
            window.document.evaluateProfiles = function() {
                var profiles = [];
                window.NodeList.prototype.forEach = window.Array.prototype.forEach;
                document.querySelectorAll(".fbProfileBrowserListItem").forEach(function(item, index) {
                    var profile = item.querySelector("a").getAttribute("href");
                    profiles.push(profile.match(/https:\/\/www.facebook.com\/(.*)/)[1]);
                    item.parentNode.removeChild(item);
                });

                /*document.querySelectorAll(".expandedList .uiList").forEach(function(item, index) {
                              if (!item.querySelectorAll("li").length) {
                                  item.parentNode.removeChild(item);
                          }
                      });*/

                window.document.body.scrollTop = document.body.scrollHeight;

                return profiles;
            };
        });


        window.setTimeout(function evaluation() {
            page.render("facebook.png");
            var list = page.evaluate(function() {
                return window.document.evaluateProfiles();
            });

            if (list && list.length) {
                for (var i = 0; i < list.length; i++) {
                    total++;
                    fs.write("profiles.csv", list[i] + "\n", 'a');
                }
                console.log("+", list.length, "(total = " + total + ")");
            } else {
                console.log("Should exit");
                /*page.evaluate(function() {
                        window.document.body.scrollTop = 0;
                    });*/
            }

            window.setTimeout(evaluation, 400);
        }, 5000);
    });
}




page.open("http://facebook.com", function(status) {
    if (status === "success") {
        page.evaluate(function() {
            document.querySelector("input[name='email']").value = "stephane.roucheray@gmail.com";
            document.querySelector("input[name='pass']").value = "vgz2gft5";
            document.querySelector("#login_form").submit();

            console.log("Login submitted!");
        });

        window.setTimeout(function() {
            grab();
        }, 5000);
    }
});