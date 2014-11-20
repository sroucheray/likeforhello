/*global $, _, data_graphic*/
$(function() {
    "use strict";

    function update() {
        $.get("/stats/get").then(function(data) {
            $("#ofTheDay").attr("src", data.ofTheDay);
            var imgs = $(".polaroid-list img");
            imgs.each(function(index, item) {
                $(item).attr("src", data.lastPhotos[index].filename);
            });

            var score = {
                teamA: _.reduce(data.stats, function(memo, datum) {
                    return datum["Equipe A"] + memo;
                }, 0),
                teamB: _.reduce(data.stats, function(memo, datum) {
                    return datum["Equipe B"] + memo;
                }, 0),
                teamC: _.reduce(data.stats, function(memo, datum) {
                    return datum["Equipe C"] + memo;
                }, 0)
            };

            $(".team-a-score").text(score.teamA);
            $(".team-b-score").text(score.teamB);
            $(".team-c-score").text(score.teamC);


            var stats = [];

            stats.push(_.map(data.stats, function(datum) {
                var val = {
                    date: new Date(datum.Jour),
                    value: datum["Equipe A"]
                };

                return val;
            }));

            stats.push(_.map(data.stats, function(datum) {
                var val = {
                    date: new Date(datum.Jour),
                    value: datum["Equipe B"]
                };

                return val;
            }));

            stats.push(_.map(data.stats, function(datum) {
                var val = {
                    date: new Date(datum.Jour),
                    value: datum["Equipe C"]
                };

                return val;
            }));

            data_graphic({
                data: stats,
                width: 800,
                height: 200,
                target: "#graphic-data",
                x_accessor: "date",
                y_accessor: "value",
                min_x: new Date("2014-11-15"),
                max_x: new Date("2014-12-14"),
                area: false
            });
        });

        setTimeout(update, 1000 * 60 * 5);
    }

    function slide(){
        var polas = $(".polaroid-list a");
        var current = polas.eq(0);
        current.addClass("slide");
        setTimeout(function(){
            current.insertAfter(polas.eq(polas.length - 1));
            setTimeout(function(){
                current.removeClass("slide");
                setTimeout(slide, 5000);
            }, 1000);
        }, 1000);
    }

    setTimeout(slide, 2000);

    update();


});
