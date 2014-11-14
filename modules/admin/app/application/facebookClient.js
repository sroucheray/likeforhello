/*eslint camelcase:0 */
"use strict";
var Q = require("q");
var FB = require("fb");
var request = require("request");
var debug = require("debug")("admin:facebook");

var appUrl = "https://www.facebook.com/VVFVillages.pageofficielle/app_708032399246642"; // VVF
//var appUrl = "https://www.facebook.com/pages/Test/646711455426673?sk=app_708032399246642&ref=page_internal"; // Test

var redirectUri = "https://hello.fb.byperiscope.com/redirect_uri";
var appId = "708032399246642";
var appSecret = "e0f5ab430e8103e232ecba342d091d38";
//var pageId = "194889667305745";
var pageId = "646711455426673";
var albumId = "580681488726559"; // VVF
//var albumId = "650193648411787"; // Test


/*
    // Execute this code in the embeded page to authorize app manage the page
    // It should log access_token
    FB.login(function() {
        FB.api('/me/accounts', 'get', {}, function(response) {
            console.log(response);
        });
    }, {
        perms: 'publish_stream,offline_access,manage_pages'
    });

    "CAAKD86OlhTIBAOiZBrIwZAYq4AhljIyxDe398Dr6LFdpmrUBtMXZC0GfxHegZC8QgJBRwmBXsHXtV39N1fIxVKKTc2yv2blfyvIp0Xmvk13diStutTD9QOjp6NteiZB5pRxdCexl7cJhh8HYdZB9OZBzUOpxwyfxYHrrkhCwut1WAbrueZB1dPG5tIaIX0CEdUc8pTqn9iISfIiwytkvZB2IT"
*/


/*
    1 - Get the code
    https://www.facebook.com/dialog/oauth?client_id=708032399246642&redirect_uri=https://hello.fb.byperiscope.com/redirect_uri&scope=manage_pages,publish_actions


//VVF :
{ code: 'AQD7d-WNqMKmPtR8gpSMAs7G1DmQSIarbYeOM0Zi-bQKygUBt7NbNWhQauKjd-A3YQC0NtThPjvF84H0JFj-NDxTl2YBR1msbeQsGnpWkzDbF04hMKQwbzOxUo3VOISto1zQ9DxM-9RF6Apl9CeQRZVWSCL0NAhqqlkAUpI6hsKd-6_meY4EE_nohe4ZsMdY0uLDtpKaL0uFDYgdwp8g7ivO03w3rooZ67h1ti3Z3m8GpD-eogb9eHROh6iNqc9mc80cd0z4J_zVos5ZeFkLtldPDLMI_v3m9yKKjc4hlcNf_ZixG-PGWdxVTMF4FfAwmn-hbj_V-bIcBRMJwcHXV2_h' }


    2 - Get the access token with the code
    https://graph.facebook.com/oauth/access_token?client_id=708032399246642&redirect_uri=https://hello.fb.byperiscope.com/redirect_uri&client_secret=e0f5ab430e8103e232ecba342d091d38&code=AQD7d-WNqMKmPtR8gpSMAs7G1DmQSIarbYeOM0Zi-bQKygUBt7NbNWhQauKjd-A3YQC0NtThPjvF84H0JFj-NDxTl2YBR1msbeQsGnpWkzDbF04hMKQwbzOxUo3VOISto1zQ9DxM-9RF6Apl9CeQRZVWSCL0NAhqqlkAUpI6hsKd-6_meY4EE_nohe4ZsMdY0uLDtpKaL0uFDYgdwp8g7ivO03w3rooZ67h1ti3Z3m8GpD-eogb9eHROh6iNqc9mc80cd0z4J_zVos5ZeFkLtldPDLMI_v3m9yKKjc4hlcNf_ZixG-PGWdxVTMF4FfAwmn-hbj_V-bIcBRMJwcHXV2_h


//VVF :
access_token=CAAKD86OlhTIBABL8Vh7zT1UTv2UJUxxjFqFfiW1dj7aRdxEwwhrWl4ZAFdoIgcEAXSStC8QZBsZBRgxzvYK8NscXLj56vG6Is2ZBOPmLLNJqTF5NihCmaeOOlYOxkqzO7CUkSx6ZC3HCqEHZCTUfMQkZCm8jZA26EPU9Jk4FJkwZALhz4VCS8mt65AWuNz1trux5Sdx8Q4MZCb14GZCnBleZAAeZA

    3 - The access token
    CAAKD86OlhTIBAJGDrQ1eZCCSD3rLMRcDt2gAK98v3O3oeVB2t6SnAykAA1JLbZA2XaH5BdTKtwjpBqiojUpwRlEgwd9yntRWEZAeFzTpKbsKrEuZBrfIu9A2VZBNMs9DkyeA1zU25iy02APqhiCNwpj5BPArnJPbURGCf0KtlSWEqDb1fw8sWS3lZCb7ovd3YlWfd4WoHxpRp4ZCZA3XwbZBh&expires=5181350

    4 - Get the page access token
    https://graph.facebook.com/me/accounts?access_token=CAAKD86OlhTIBABL8Vh7zT1UTv2UJUxxjFqFfiW1dj7aRdxEwwhrWl4ZAFdoIgcEAXSStC8QZBsZBRgxzvYK8NscXLj56vG6Is2ZBOPmLLNJqTF5NihCmaeOOlYOxkqzO7CUkSx6ZC3HCqEHZCTUfMQkZCm8jZA26EPU9Jk4FJkwZALhz4VCS8mt65AWuNz1trux5Sdx8Q4MZCb14GZCnBleZAAeZA

        {
           "data": [
              {
                 "category": "Travel/leisure",
                 "name": "Test",
                 "access_token": "CAAKD86OlhTIBAPRP7ZBkKdgfE0xKvx0uN8ko2Wyqx7ItqJqZCZAL1ZCJWIVIaDbxqEenVjoqx0dl9qL0GUDMHSacY05xxA8Azcd1rInUxrih6s6HoKkkzddRunvysgZA739Jg1KOwW04kdtsYtZAVRzdBUkn0UVcfNA4JFJ6OU9TZCeZCAq4HZCbaVuO9eQFSNi2iwuHHrb7PWGF2Uf7dDFhR",
                 "perms": [
                    "ADMINISTER",
                    "EDIT_PROFILE",
                    "CREATE_CONTENT",
                    "MODERATE_CONTENT",
                    "CREATE_ADS",
                    "BASIC_ADMIN"
                 ],
                 "id": "646711455426673"
              },
              {
                 "category": "Travel/leisure",
                 "category_list": [
                    {
                       "id": "162914327091136",
                       "name": "Travel Agency"
                    }
                 ],
                 "name": "VVF Villages",
                 "access_token": "CAAKD86OlhTIBAOUwvla8tuakH2cZC9o23cUfZAnYr3EMswJPQg4OZA9bHuFwbIpZBfRh9NqDqqGv6AAY5tWOg9a5yZCfZAhAtL0nXtl1XOSG0LhxSkHAUDNkiJ1DRoMZBVHTxPWdcCpcQxCgARjrx3Q2dhpGeYei3Hmi84HcowzeGImoFZCETGrXrq4VaPaKGA6kZCRx41hnU55afQ3hIMnJR",
                 "perms": [
                    "ADMINISTER",
                    "EDIT_PROFILE",
                    "CREATE_CONTENT",
                    "MODERATE_CONTENT",
                    "CREATE_ADS",
                    "BASIC_ADMIN"
                 ],
                 "id": "194889667305745"
              }
           ],
           "paging": {
              "next": "https://graph.facebook.com/v2.1/10203709714678221/accounts?access_token=CAAKD86OlhTIBAJGDrQ1eZCCSD3rLMRcDt2gAK98v3O3oeVB2t6SnAykAA1JLbZA2XaH5BdTKtwjpBqiojUpwRlEgwd9yntRWEZAeFzTpKbsKrEuZBrfIu9A2VZBNMs9DkyeA1zU25iy02APqhiCNwpj5BPArnJPbURGCf0KtlSWEqDb1fw8sWS3lZCb7ovd3YlWfd4WoHxpRp4ZCZA3XwbZBh&limit=1000&offset=1000&__after_id=enc_AezJiT66CbqmvnUHH0W4cCQnZTjZi7gpMGmI4123XcXgPxwmXVS27iqBTXHv9swoo8BOsK0AzqefOEvV67VyVX8x"
           }
        }





//VVF :

{
   "data": [
      {
         "category": "Travel/leisure",
         "category_list": [
            {
               "id": "162914327091136",
               "name": "Travel Agency"
            }
         ],
         "name": "VVF Villages",
         "access_token": "CAAKD86OlhTIBAFSpm0W9egZB761g8BZANyoiTQgE6Hvco7Dkm5XGtDWVlW9krHB3ZALw4jjqSHxxqwZCRYBCvE7U8TZAkcfepLGyWt3oN29cHvAteNZAdJkhRU9iZCaVBYLZA4TbnaRQGlRxYE4IlU3FytJZBdxSbcrDqcdl53Ez3DGccX15oZBZA5acPnKfaxssBiS1OXJsbHFY8C9Q5Lv8WQa",
         "perms": [
            "ADMINISTER",
            "EDIT_PROFILE",
            "CREATE_CONTENT",
            "MODERATE_CONTENT",
            "CREATE_ADS",
            "BASIC_ADMIN"
         ],
         "id": "194889667305745"
      },
      {
         "category": "Travel/leisure",
         "name": "Test",
         "access_token": "CAAKD86OlhTIBAJmKUdZAYfiZCj0GO4TGPvn1bwZAdaiBY2c7a5gAZAlzPDsuSSQZALPYQDjgUAdmhFJMqxMLI0DypxMQv70cHpyH60I8piPRetLDCtQijlScdbGGuDkXapw31BUzY6IlZBA5ZAqo3JkS9wvQgFYI0zO0ZCSWpGQCxsoZBgbzuZBShJZB1t7CGvghLNhZBrfESkoyDHo4rZBNPhpUT",
         "perms": [
            "ADMINISTER",
            "EDIT_PROFILE",
            "CREATE_CONTENT",
            "MODERATE_CONTENT",
            "CREATE_ADS",
            "BASIC_ADMIN"
         ],
         "id": "646711455426673"
      },
      {
         "category": "App page",
         "name": "Like for Hello Community",
         "access_token": "CAAKD86OlhTIBAHBVFZBz1xE73PPeREcREW3ajqXh9nbSs4fpxJxFcNOBFKqkhRfPgMjkd7aTN6OZBcfvUPCrWFt4awP97RgYmCkftgGvU6oETI5qNDRJTpwV5iyv2Ix2XSthL9yigZAbJwfgxQU3yCdCnay5LCn8pcF1tOyUYnFZCLAZCs7vEx19wZA2ZA8mxmsX036GCZAo5p9pylyUT82b",
         "perms": [
            "ADMINISTER",
            "EDIT_PROFILE",
            "CREATE_CONTENT",
            "MODERATE_CONTENT",
            "CREATE_ADS",
            "BASIC_ADMIN"
         ],
         "id": "1567785533442560"
      }
   ],
   "paging": {
      "next": "https://graph.facebook.com/v2.1/10203709714678221/accounts?access_token=CAAKD86OlhTIBABL8Vh7zT1UTv2UJUxxjFqFfiW1dj7aRdxEwwhrWl4ZAFdoIgcEAXSStC8QZBsZBRgxzvYK8NscXLj56vG6Is2ZBOPmLLNJqTF5NihCmaeOOlYOxkqzO7CUkSx6ZC3HCqEHZCTUfMQkZCm8jZA26EPU9Jk4FJkwZALhz4VCS8mt65AWuNz1trux5Sdx8Q4MZCb14GZCnBleZAAeZA&limit=1000&offset=1000&__after_id=enc_AezdKgHNnvewyTOk7DYWWWYYC4267fYNJCuLzsIU6OW5BTFm5eO0I_eYIEC7CEwdSTg8wIR_euZ7ZaElbGhFHWPo"
   }
}








*/



var pageToken = "CAAKD86OlhTIBAFSpm0W9egZB761g8BZANyoiTQgE6Hvco7Dkm5XGtDWVlW9krHB3ZALw4jjqSHxxqwZCRYBCvE7U8TZAkcfepLGyWt3oN29cHvAteNZAdJkhRU9iZCaVBYLZA4TbnaRQGlRxYE4IlU3FytJZBdxSbcrDqcdl53Ez3DGccX15oZBZA5acPnKfaxssBiS1OXJsbHFY8C9Q5Lv8WQa"; // VVF
//var pageToken = "CAAKD86OlhTIBAPRP7ZBkKdgfE0xKvx0uN8ko2Wyqx7ItqJqZCZAL1ZCJWIVIaDbxqEenVjoqx0dl9qL0GUDMHSacY05xxA8Azcd1rInUxrih6s6HoKkkzddRunvysgZA739Jg1KOwW04kdtsYtZAVRzdBUkn0UVcfNA4JFJ6OU9TZCeZCAq4HZCbaVuO9eQFSNi2iwuHHrb7PWGF2Uf7dDFhR"; // Test

var expandedPageToken = "CAAKD86OlhTIBAFSpm0W9egZB761g8BZANyoiTQgE6Hvco7Dkm5XGtDWVlW9krHB3ZALw4jjqSHxxqwZCRYBCvE7U8TZAkcfepLGyWt3oN29cHvAteNZAdJkhRU9iZCaVBYLZA4TbnaRQGlRxYE4IlU3FytJZBdxSbcrDqcdl53Ez3DGccX15oZBZA5acPnKfaxssBiS1OXJsbHFY8C9Q5Lv8WQa";
//var pageToken = "CAAKD86OlhTIBADjJjgkfUj6lDgNOoW4HjnZCaHlo7zZBHkt07WZBX1gh5ub8C3LNwzK0vHANEy4N6SX9g2M3gZCkTnDWbSQPApIZCC4ElTbnnDM0cyNSrjj5WcIodz3BEKse18xfahslicTwanZBnojcGIqpZBdeGfTQ2GLbVsb21yEjINueKrDrIvvmFEeFS0ZD";
var apptoken = "708032399246642|Zyr06kV4-b-f1BCOKBbnAuHmp3w";
FB.qapi = Q.denodeify(FB.napi);
FB.request = Q.denodeify(request);


function FacebookClient(options) {
    //FB.setAccessToken(accessToken);
    this.options = options;

    this.appUrl = appUrl;
    this.pageId = pageId;
}

FacebookClient.prototype.buildNode = function() {
    return "/" + Array.prototype.join.call(arguments, "/");
};

FacebookClient.prototype.getArgs = function(args, index) {
    return Array.prototype.slice.call(args, index);
};

FacebookClient.prototype.api = function(node, args) {
    args = args || [];
    args.unshift(node);
    debug("Facebook", args);
    return FB.qapi.apply(FB, args);
};

FacebookClient.prototype.getPage = function(pageId) {
    var node = this.buildNode(pageId);
    var args = this.getArgs(arguments, 1);
    return this.api(node, args);
};

FacebookClient.prototype.getAlbums = function() {
    var node = this.buildNode(this.options.pageId, "albums");
    var args = this.getArgs(arguments, 1);
    return this.api(node, args);
};

FacebookClient.prototype.getAlbum = function(albumId) {
    var node = this.buildNode(albumId);
    var args = this.getArgs(arguments, 1);
    return this.api(node, args);
};

FacebookClient.prototype.getAccessToken = function() {
    var node = this.buildNode("oauth", "access_token");
    var args = this.getArgs(arguments, 0);
    return this.api(node, args);
};

FacebookClient.prototype.getAppToken = function() {
    return this.getAccessToken({
        client_id: this.options.appId,
        client_secret: this.options.appSecret,
        grant_type: "client_credentials"
    });
};

FacebookClient.prototype.expandToken = function(token) {
    return this.getAccessToken({
        client_id: this.options.appId,
        client_secret: this.options.appSecret,
        grant_type: "fb_exchange_token",
        fb_exchange_token: token
    });
};

FacebookClient.prototype.debugToken = function() {
    var node = this.buildNode("debug_token");
    var args = this.getArgs(arguments, 0);
    return this.api(node, args);
};



FacebookClient.prototype.postUserStory = function(opts) {
    var node = this.buildNode("me", "feed");
    var args = [
        "POST", opts
    ];
    return this.api(node, args);
};

FacebookClient.prototype.postPageStory = function(opts) {
    var node = this.buildNode(pageId, "feed");
    var args = [
        "POST", opts
    ];
    return this.api(node, args);
};

FacebookClient.prototype.postPagePhoto = function(opts) {
    var node = this.buildNode(albumId, "photos");
    var args = [
        "POST", opts
    ];
    return this.api(node, args);
};

FacebookClient.prototype.greetingVisitor = function(visitor, image) {
    debug("Greeting visitor %s (%s) with image %s", visitor.name, visitor.id, image);
    return this.postUserStory({
        message: visitor.message,
        access_token: visitor.expanded_access_token,
        tags: [visitor.id].join(","),
        privacy: {
            value: "SELF"
        },
        actions: {
            name: "Demande ton Bonjour à VVF Villages !",
            link: appUrl
        },
        place: pageId,
        link: appUrl,
        picture: image, //res.link,
        name: "L’équipe de VVF Villages vient de me dire Bonjour !",
        caption: "Quelle ambiance !",
        description: "Qui sera le plus rapide à venir vous dire Bonjour ?"
    });
};

FacebookClient.prototype.postPhotoOnPage = function(visitorsName, image) {
    debug("Post photo %s on album %s in page %s", image, albumId, pageId);
    return this.postPagePhoto({
        url: image,
        message: visitorsName ? "L'équipe de VVF Villages vient de dire un petit bonjour à " + visitorsName.join(", ") : "L'équipe de VVF Villages vient de passer un petit bonjour",
        place: pageId,
        no_story: true,
        access_token: expandedPageToken
    });
};



FacebookClient.prototype.renewAccessToken = function() {
    /*    this.expandToken(pageToken).then(function(res) {
        debug("Success", res);
    }).fail(function(error) {
        debug("Error actve token");
        console.error(error);
    });*/
    this.getAppToken().then(function(res) {
        debug("Success", res);
    }).fail(function(error) {
        debug("Error actve token");
        console.error(error);
    });
    /*this.postPagePhoto({
        message: "Nous venons de dire un petit bonjour à Stéphane 3",
        access_token: expandedPageToken,
        place: pageId,
        url: "https://fb.byperiscope.com/photos/35542150-7d6a-4e49-9717-9c864716baae.jpg", //res.link,
        no_story: true
    }).then(function(res) {
        debug("Success", res);
    }).fail(function(error) {
        debug("Error actve token");
        debug(error);
    });*/

    /*    this.getAppToken().then(function(res) {
        debug("Success", res);
    }).fail(function(error) {
        debug("Error actve token");
        console.error(error);
    });
    this.postUserStory({
        message: "Une opération rigolote de la part de VVF.\nTu leur demande et ils te font un vrai bonjour personnalisé !",
        access_token: "CAAKD86OlhTIBAOmttSd1rtBEvwQ0dENJUQpUeD9ZBKhj1HxwmMXWSe3SxZBzf8Y3EvZAWhZBEIQ5bi2ZBm6Mij2dZCCy1uiYTdCVYhWuJkBqZBe6RTyeQmZAgevpz8C493rj8txKEZBdzDbxOYmeb0KsmATfdcQSwFZCTZBGIrZArW31BnlVyZBAkzyJben8nLpBMp5UZD",
        tags: ["10203709714678221"].join(","),
        privacy: {
            value: "SELF"
        },
        actions: {
            name: "Demande toi aussi un petit Bonjour ! à VVF",
            link: appUrl
        },
        place: pageId,
        link: appUrl,
        picture: "https://fb.byperiscope.com:8080/photos/35542150-7d6a-4e49-9717-9c864716baae.jpg", //res.link,
        name: "L'équipe de VVF vient de me dire Bonjour",
        caption: "Demande toi aussi un petit Bonjour !",
        description: "L'ambiance de travail à l'air sympa chez VVF"
        //}
    }).then(function(res) {
        return this.postPageStory({
            message: "Nous venons de dire un petit bonjour à Stéphane",
            access_token: apptoken,
            published: true,
            actions: {
                name: "Demande toi aussi un petit Bonjour ! à VVF",
                link: appUrl
            },
            place: pageId,
            link: appUrl,
            picture: "https://fb.byperiscope.com:8080/photos/35542150-7d6a-4e49-9717-9c864716baae.jpg", //res.link,
            name: "L'équipe de VVF vient de me dire Bonjour",
            caption: "Demande toi aussi un petit Bonjour !",
            description: "L'ambiance de travail à l'air sympa chez VVF"
            //}
        }).then(function(res) {
            debug("Success", res);
        }).fail(function(error) {
            debug("Error actve token");
            console.error(error);
        });
    }.bind(this));*/
};

FacebookClient.prototype.redirectMiddleware = function(req, res) {
    debug("Redirect middleware");
    debug("Body", req.body);
    debug("Params", req.params);
    debug("Query", req.query);
    //{"body":{"signed_request":"gnoG1zeWDuu0SKbXS33ksj5zeFdyspq-6MPYV_ZwYhQ.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImV4cGlyZXMiOjE0MTU3MDM2MDAsImlzc3VlZF9hdCI6MTQxNTY5ODk3MCwib2F1dGhfdG9rZW4iOiJDQUFLRDg2T2xoVElCQUJjWWNEQ1lpZ3FuRWlDWkFnbExCS29yOXF4YWlERllmRkhVTkxvUFVYNFREa1pCTERNSjh0NTBaQlZwSG5QTGh1ZFpBZFh1OWNOUW9ZbmFYN1NvcHZkZjQ4TGtCNkxxUXhLcm1ka3lRb21CWFA2RTNnMlVYb1ltbW1iMDVXUkFOejl0YXZxSXBEQ1pBUTFaQUUxU09NTVE5V0V3R0kxZWM2UUNsOHdBWkI4S29XNDZOaGxwektrSXpUeTFETUlRaFlyWExQaWptdXhnOUJ1RXZ0VUtxd1pEIiwidXNlciI6eyJjb3VudHJ5IjoiZnIiLCJsb2NhbGUiOiJmcl9GUiIsImFnZSI6eyJtaW4iOjIxfX0sInVzZXJfaWQiOiIxMDIwMzcwOTcxNDY3ODIyMSJ9","fb_locale":"fr_FR"},"params":{},"query":{}}
    /*res.json({
        body: req.body,
        params: req.params,
        query: req.query
    });*/
    res.redirect("/");
};

new FacebookClient({
    appId: appId,
    appSecret: appSecret,
    pageId: pageId
}).renewAccessToken();

module.exports = function() {
    return new FacebookClient({
        appId: appId,
        appSecret: appSecret,
        pageId: pageId
    });
};