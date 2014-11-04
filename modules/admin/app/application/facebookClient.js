/*eslint camelcase:0 */
"use strict";
var Q = require("q");
var FB = require("fb");
var request = require("request");
var _ = require("underscore");
var debug = require("debug")("admin:facebook");

var appUrl = "https://www.facebook.com/pages/Test/646711455426673?sk=app_708032399246642&ref=page_internal";
var redirectUri = "https://hello.fb.byperiscope.com/redirect_uri";
var appId = "708032399246642";
var appSecret = "e0f5ab430e8103e232ecba342d091d38";
//var pageId = "194889667305745";
var pageId = "646711455426673";
//var albumId = "563322363795805";
var albumId = "650193648411787";


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
*/


/*
    1 - Get the code
    https://www.facebook.com/dialog/oauth?client_id=708032399246642&redirect_uri=https://fb.byperiscope.com:444/redirect_uri&scope=manage_pages,publish_actions


    2 - Get the access token with the code
    https://graph.facebook.com/oauth/access_token?client_id=708032399246642&redirect_uri=https://fb.byperiscope.com:444/redirect_uri&client_secret=e0f5ab430e8103e232ecba342d091d38&code=AQCv0pr1rETtOUvs30iHbby5nKkntIrI0CfoTiryzUT61doXtvBS6_Lv94ru_GxrMcYCGXvhXDGp8FWoOTNbZtIyqsS13yivXVJYdFPfqweIoumzn0cH1bwR64IHwgP18VErQWwD2SZHkj0CmwV1IWgC_Zt6m-RyAE6HfPrNrsUZcdcTFmcwrbOU0steCfVcqHup5TCHv5a9r65UlLAqD-mpwTRv6Axn1R9VW_nKSQD5GszOvPLduoyzVrqvbkdCDTsX7NSSXQPxDM_vuIAzqQudyHLUU85ZlyUAJlAm-JfY-0g0vQ2ZaMAJ4imRelhLENz6uu0OSiDXHxqISjubgvvH

    3 - The access token
    CAAKD86OlhTIBAJGDrQ1eZCCSD3rLMRcDt2gAK98v3O3oeVB2t6SnAykAA1JLbZA2XaH5BdTKtwjpBqiojUpwRlEgwd9yntRWEZAeFzTpKbsKrEuZBrfIu9A2VZBNMs9DkyeA1zU25iy02APqhiCNwpj5BPArnJPbURGCf0KtlSWEqDb1fw8sWS3lZCb7ovd3YlWfd4WoHxpRp4ZCZA3XwbZBh&expires=5181350

    4 - Get the page access token
    https://graph.facebook.com/me/accounts?access_token=CAAKD86OlhTIBAJGDrQ1eZCCSD3rLMRcDt2gAK98v3O3oeVB2t6SnAykAA1JLbZA2XaH5BdTKtwjpBqiojUpwRlEgwd9yntRWEZAeFzTpKbsKrEuZBrfIu9A2VZBNMs9DkyeA1zU25iy02APqhiCNwpj5BPArnJPbURGCf0KtlSWEqDb1fw8sWS3lZCb7ovd3YlWfd4WoHxpRp4ZCZA3XwbZBh

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


*/


//var pageToken = "CAAKD86OlhTIBAEeY51COSCo5TqZAMkM7C87P5sZBTHFsETXBj71UUfjZB0H9W6uhgYSV35MrZAJk2UIPmGHbGL00C3BhZBJhpblD70tq2gsOHlFUkQsc1SsQvGjEXl9TimBs9aZCYw0PUbwwRaKotZAKZCjsTM5f7woaqou1LjmiILgXWCNL0OIxnXwmKQ2TYDbiPGbri6TZC9lE907HZCkxNd";

var pageToken = "CAAKD86OlhTIBAPRP7ZBkKdgfE0xKvx0uN8ko2Wyqx7ItqJqZCZAL1ZCJWIVIaDbxqEenVjoqx0dl9qL0GUDMHSacY05xxA8Azcd1rInUxrih6s6HoKkkzddRunvysgZA739Jg1KOwW04kdtsYtZAVRzdBUkn0UVcfNA4JFJ6OU9TZCeZCAq4HZCbaVuO9eQFSNi2iwuHHrb7PWGF2Uf7dDFhR";
var expandedPageToken = "CAAKD86OlhTIBAAMX6vhe0ulZBYPLcASQu3vshGZB20yYaF89BiiaXSrC1LFOinuwyUbBqupyL1Cvd3p5dwhtdoMEZA3vi2eh76Y0lSj2rwHbIzRbk6AjmZAz3klE1Nz1dmjqN7ZC29OVwZA1gz3nSQUrncbrMghtJwEOO5i8fDxVw0IeWoCnfHNswBFCzUkZCgZD";
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
    console.log("Facebook", args);
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
        message: "Super idée de VVF Villages : envoyer un Bonjour à ceux qui le demande!",
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
        message: "L'équipe de VVF Village vient de dire un petit bonjour à " + visitorsName.join(", "),
        place: pageId,
        no_story: true,
        access_token: expandedPageToken
    });
};



FacebookClient.prototype.renewAccessToken = function() {
    /*    this.expandToken(pageToken).then(function(res) {
        console.log("Success", res);
    }).fail(function(error) {
        console.log("Error actve token");
        console.error(error);
    });*/
    this.postPagePhoto({
        message: "Nous venons de dire un petit bonjour à Stéphane 3",
        access_token: expandedPageToken,
        place: pageId,
        url: "https://fb.byperiscope.com/photos/35542150-7d6a-4e49-9717-9c864716baae.jpg", //res.link,
        no_story: true
    }).then(function(res) {
        console.log("Success", res);
    }).fail(function(error) {
        console.log("Error actve token");
        console.error(error);
    });

    /*    this.getAppToken().then(function(res) {
        console.log("Success", res);
    }).fail(function(error) {
        console.log("Error actve token");
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
            console.log("Success", res);
        }).fail(function(error) {
            console.log("Error actve token");
            console.error(error);
        });
    }.bind(this));*/
};

FacebookClient.prototype.redirectMiddleware = function(req, res) {
    console.log("Body", req.body);
    console.log("Params", req.params);
    console.log("Query", req.query);
    res.json({
        body: req.body,
        params: req.params,
        query: req.query
    });
};

/*new FacebookClient({
    appId: appId,
    appSecret: appSecret,
    pageId: pageId
}).renewAccessToken(pageToken);*/

module.exports = function() {
    return new FacebookClient({
        appId: appId,
        appSecret: appSecret,
        pageId: pageId
    });
};