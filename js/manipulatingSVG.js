/**
 * Created by Alicia on 11/26/16.
 */

var w = window.outerWidth;
var h = window.outerHeight;
var svg = d3.select(map.getPanes().overlayPane).select("svg");
var _variableCircleSize = true;
var lineChartData = [];
var _totalActive = 0;
var _totals = {};
var _pause = false;
var textBox = d3.select("#datestamp").append("svg").attr("width", 125).attr("height", 30).append("text").attr("x", 0).attr("y", 25).text("Monday 00:00");


// var neighborhoodNames = ["Back Bay", "Downtown", "South End", "North End", "Central Square", "Harvard Square","Kendall Square","Somerville","Porter Square","Jamaica Plain","Brookline"];

var neighborhood = ["Total"];

function addNeighborhoods(item) {
    _totals[item] = 0;
}

function start() {

    $(".legend-div").click(function () {
        var clickedID = this.id;
        console.log(clickedID);
        var lineID = ".line#" + clickedID;
        console.log($(lineID));
        $(this).toggleClass("dimmed-legend");
        d3.select(lineID).classed("dimmed-line", function (d, i) {
            return !d3.select(this).classed("dimmed-line");
        });


    })

    d3.json("../data/places-hours-neighborhoods.geojson", function (error, points) {
        if (error) throw error;
        var g = svg.append("g").attr("class", "leaflet-zoom-hide");
        var pointData = points.features;

        //assign leaflet latlon from coordinates
        pointData.forEach(function (d, i) {
            d.indexID = i;
            // console.log(d.hours.length);
            if (d.geometry.coordinates[1] === null) {
                d.LatLng = new L.LatLng(0, 0)
            }
            else {
                d.LatLng = new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])
            }
        })

        //put larger dots on bottom
        pointData.sort(function (a, b) {
            return b.properties.reviews - a.properties.reviews;
        });

        //draw dots
        var circles = g.selectAll("circle")
            .data(pointData)
            .enter()
            .append("circle")
            .attr("class", "unselected on")
            .attr("r", 5);

        pointsUpdate();
        map.on("viewreset", pointsUpdate);

        //option to resize dots
        function circleSize(d) {
            if (d.properties.reviews > 10) {
                return Math.sqrt(parseInt(d.properties.reviews) * 0.15);
            }
            else if (d.properties.reviews > 50) {
                return Math.sqrt(parseInt(d.properties.reviews) * .05);
            }
            else {
                return 3;
            }
        }


        function pointsUpdate() {
            var max = d3.max(pointData, function (d) {
                return +d.properties.reviews;
            });
            var min = d3.min(pointData, function (d) {
                return +d.properties.reviews;
            });
            var oScale = d3.scaleLinear()
                .domain([min, max])
                .range([0.8, 0.5]);
            circles.attr("cx", function (d) {
                return map.latLngToLayerPoint(d.LatLng).x
            });
            circles.attr("cy", function (d) {
                return map.latLngToLayerPoint(d.LatLng).y
            });
            circles.attr("r", function (d) {
                if (_variableCircleSize == true) {
                    return circleSize(d);
                }
                else {
                    return 2;
                }
            });
            circles.attr("callit", function (d) {
                return d.properties.name
            });
            circles.attr("neighborhood", function (d) {
                return d.properties.neighborhood
            });
            circles.attr("id", 0);
            circles.style("fill", "rgba(235,255,255,0.1)");

        }

        var time = 00;
        var previousTime;
        var date = new Date(2017, 0, 16, 0, 0, 0, 0);
        // date.setHours(0, 0, 0, 0);

        update();


        function update(startTime) {

            // circles.classed("selected", false);
            // circles.classed("unselected", true);

            if (startTime === undefined) {
                time = time;
            }
            else {
                time = startTime;
            }

            previousTime = time;
            // document.getElementById("timestamp").innerHTML = time;
            time = time + 30;


            var filtered = circles.filter(function (d) {
                return (
                d.hours[0].openMinutes < time && d.hours[0].closedMinutes > time ||
                d.hours[1].openMinutes < time && d.hours[1].closedMinutes > time ||
                d.hours[2].openMinutes < time && d.hours[2].closedMinutes > time ||
                d.hours[3].openMinutes < time && d.hours[3].closedMinutes > time ||
                d.hours[4].openMinutes < time && d.hours[4].closedMinutes > time ||
                d.hours[5].openMinutes < time && d.hours[5].closedMinutes > time ||
                d.hours[6].openMinutes < time && d.hours[6].closedMinutes > time);
            });
            // filtered.attr("class", "selected");

            var remaining = circles.filter(function (d) {
                return !(
                d.hours[0].openMinutes < time && d.hours[0].closedMinutes > time ||
                d.hours[1].openMinutes < time && d.hours[1].closedMinutes > time ||
                d.hours[2].openMinutes < time && d.hours[2].closedMinutes > time ||
                d.hours[3].openMinutes < time && d.hours[3].closedMinutes > time ||
                d.hours[4].openMinutes < time && d.hours[4].closedMinutes > time ||
                d.hours[5].openMinutes < time && d.hours[5].closedMinutes > time ||
                d.hours[6].openMinutes < time && d.hours[6].closedMinutes > time);
            });
            // console.log(filtered);
            // console.log("filtered: " + filtered.length + ", remaining: " + remaining.length);
            _totalActive = filtered._groups[0].length;

            for (var i = 0; i < neighborhoodNames.length; i++) {
                // neighborhoodNames.forEach(function(d) {
                //     console.log(neighborhoodNames[i]);
                var name = neighborhoodNames[i].replace(/\s+/g, '');
                var hoodFilter = filtered._groups[0].filter(function (e) {
                    // console.log(e.getAttribute('neighborhood'));
                    return e.getAttribute('neighborhood') == neighborhoodNames[i];
                })
                // console.log(hoodFilter.length);
                if (hoodFilter.length > 0) {
                    _totals[name] = hoodFilter.length;
                }
                else {
                    _totals[name] = _totals[name];
                }

            }
            showDateTime(time);
            filtered.attr("class", "selected")
            // filtered.each(function (d, i) {
            //     var current = d3.select(this);
            //     addClass(current, i);
            // });

            remaining.classed("faded", true);
            d3.selectAll(".selected.faded");

            function addClass(current, i) {
                var delay;
                setTimeout(function () {
                    if (filtered.length > 2000) {
                        delay = 5;
                    }
                    else {
                        delay = 1000;
                    }
                    current.attr("class", "selected");
                    // current.style("fill", "white");

                }, delay);
            }


            var now = new Date();
            var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var timeStop = startOfDay / 1000;


            if (time < timeStop) {
                timeOut = setTimeout(update, 1000);
            }
            else return;


            function showDateTime() {
                var weekday = new Array(7);
                weekday[0] = "Monday";
                weekday[1] = "Tuesday";
                weekday[2] = "Wednesday";
                weekday[3] = "Thursday";
                weekday[4] = "Friday";
                weekday[5] = "Saturday";
                weekday[6] = "Sunday";

                function addZeroBefore(n) {
                    return (n < 10 ? '0' : '') + n;
                }

                date.setMinutes(date.getMinutes() + 30);
                if (date.getMinutes() == 30) {
                    d3.select("#datestamp").classed("zero",false);
                }
                else {
                    d3.select("#datestamp").style("opacity", 1);
                    console.log(1);
                };
                var currentDay = date.getDay() - 1;
                currentDay = weekday[currentDay].toString();
                var currentHour = addZeroBefore(date.getHours()).toString();
                var currentMinutes = addZeroBefore(date.getMinutes()).toString();
                var dateString = date.toString();
                lineChartData.push({date: dateString, val: _totalActive});
                // dateString = dateString.slice(10, 13);
                var datestamp = document.getElementById("datestamp");
                console.log("updated");
                var textCurrentMinutes = addZeroBefore(date.getMinutes());
                // textBox.transition()
                //     .delay(10)
                //     .tween( 'text', function() {
                //         // get current value as starting point for tween animation
                //         var currentValue = +this.textContent;
                //         console.log(currentValue);
                //         console.log(textCurrentMinutes);
                //         // create interpolator and do not show nasty floating numbers
                //         var interpolator = d3.interpolateRound( currentValue, textCurrentMinutes);
                //
                //         // this returned function will be called a couple
                //         // of times to animate anything you want inside
                //         // of your custom tween
                //         return function( t ) {
                //             // set new value to current text element
                //             this.textContent = interpolator( t );
                //         };
                //     });

                textBox.transition().duration(500)
                    .text(function () {
                    return currentDay + " " + currentHour + ":" + currentMinutes
                });
                // datestamp.innerHTML = currentDay + " " + currentHour + ":" + currentMinutes;
                // datestamp.style.color = "white";
            }

            // console.log(JSON.stringify(lineChartData));
            d3.select("#pause").on("click", function () {
                $("#play").toggle().attr("replay", "true");
                $("#pause").toggle();

                clearTimeout(timeOut);
                _pause == true;
                d3.selectAll("path").transition();
                console.log("stop");
            });

            d3.select("#replay").on("click", function () {
                $("#play").hide();
                $("#pause").show();
                d3.selectAll(".selected").remove();
                start();
                console.log("restart");
            });

            d3.select(".restart").on("click", function () {
                $("#play").toggle();
                $("#pause").toggle();
                var startTime = time;
                update(startTime);
                continueExample();
                console.log("replaying...");

            });


        };

    });

}

// function start() {
//     d3.json("seattle-buildings-demolished.geojson", function (error, collection) {
//         if (error) throw error;
//
//         var svg = d3.select(map.getPanes().overlayPane).append("svg"),
//             g = svg.append("g").attr("class", "leaflet-zoom-hide");
//
//         var transform = d3.geo.transform({point: projectPoint}),
//             path = d3.geo.path().projection(transform);
//
//         var feature = g.selectAll("path")
//             .data(collection.features)
//             .enter().append("path").attr("opacity", 0).attr("stroke", "rgb(255, 124, 81)").attr("stroke-width", 2);
//
//
//         map.on("viewreset", reset);
//         reset();
//
//         // Reposition the SVG to cover the features.
//         function reset() {
//             var bounds = path.bounds(collection),
//                 topLeft = bounds[0],
//                 bottomRight = bounds[1];
//
//             svg.attr("width", bottomRight[0] - topLeft[0])
//                 .attr("height", bottomRight[1] - topLeft[1])
//                 .style("left", topLeft[0] + "px")
//                 .style("top", topLeft[1] + "px");
//
//             g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
//
//             feature.attr("d", path);
//         }
//
//         // Use Leaflet to implement a D3 geometric transformation.
//         function projectPoint(x, y) {
//             var point = map.latLngToLayerPoint(new L.LatLng(y, x));
//             this.stream.point(point.x, point.y);
//         }
//
//         var time = 1262332800;
//         var previousTime;
//         var filtered = collection.features.filter(function (d) {
//             return (d.properties.UnixIssue < 1262332800);
//         });
//
//         update();
//
//         function update(startTime) {
//
//
//             if (startTime === undefined) {
//                 time = time;
//
//             }
//             else {
//                 time = startTime;
//             }
//
//             previousTime = time;
//
//             time = time + 1233280;
//             showDateTime(time);
//             filtered = feature.filter(function (d) {
//                 return (d.properties.UnixIssue < time);
//             }).attr("class", "selected");
//
//
//             var showSelected = d3.selectAll(".selected");
//
//             var luCheck = $("lu-colors");
//
//             if ($("#exampleCheckboxSwitch").is(":checked")) {
//                 showSelected.style("fill", function (d) {
//                     if (d.properties.Category == "SINGLEFAMILY") {
//                         return "#F3F319";
//                     }
//                     else if (d.properties.Category == "MULTIFAMILY") {
//                         return "#F7AB21";
//                     }
//                     else if (d.properties.Category == "COMMERCIAL") {
//                         return "#FF625D";
//                     }
//                     else if (d.properties.Category == "INSTITUTIONAL") {
//                         return "#6198C5";
//                     }
//                     else {
//                         return "#F3F319";
//                     }
//                 });
//             }
//             else {
//                 showSelected.style("fill", "rgb(255, 124, 81)");
//                 console.log("failed");
//             }
//
//             showSelected.transition().duration(500).attr("opacity", 1).each(slide);
//
//             function slide() {
//                 var onePath = d3.select(this);
//                 (function repeat() {
//                     onePath = onePath
//                         .transition()
//                         .duration(350)
//                         .attr("stroke", "white")
//                         .attr("stroke-width", 20)
//                         .style("stroke-opacity", 0)
//                     ;
//                     // .each("end", repeat);
//                 })();
//             }
//
//             // console.log(time);
//             // console.log(filtered);
//
//             var now = new Date();
//             var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//             var timeStop = startOfDay / 1000;
//             // console.log(timeStop);
//
//             if (time < timeStop) {
//                 timeOut = setTimeout(update, 100);
//             }
//             else return;
//         }
//
//         function showDateTime(time) {
//             var newDate = new Date();
//             newDate.setTime(time * 1000);
//             dateString = newDate.toString();
//             dateString = dateString.slice(0, 16);
//             document.getElementById("timestamp").innerHTML = dateString;
//         }
//
//         d3.select("#pause").on("click", function () {
//             $("#play").toggle().attr("replay", "true");
//             $("#pause").toggle();
//
//             clearTimeout(timeOut);
//             console.log("stop");
//         });
//
//         d3.select("#replay").on("click", function () {
//             $("#play").hide();
//             $("#pause").show();
//             d3.selectAll(".selected").remove();
//             start();
//             console.log("restart");
//         });
//
//         d3.select(".restart").on("click", function () {
//             $("#play").toggle();
//             $("#pause").toggle();
//             var startTime = time;
//             update(startTime);
//             console.log("replaying...");
//
//         });
//
//
//     });
//
//
// }

d3.select(".start").on("click", function () {
    $("#play").toggle();
    $("#play").attr("class", "control restart");
    $("#pause").toggle();
    start();
    runExample();
});

$("#exampleCheckboxSwitch").change(function () {

    var showSelected = d3.selectAll(".selected");
    var luCheck = $("lu-colors");

    if ($("#exampleCheckboxSwitch").is(":checked")) {
        $("#lu-legend").slideDown(150);
        showSelected.style("fill", function (d) {
            if (d.properties.Category == "SINGLEFAMILY") {
                return "#F3F319";
            }
            else if (d.properties.Category == "MULTIFAMILY") {
                return "#F7AB21";
            }
            else if (d.properties.Category == "COMMERCIAL") {
                return "#FF625D";
            }
            else if (d.properties.Category == "INSTITUTIONAL") {
                return "#6198C5";
            }
            else {
                return "#F3F319";
            }
        });
    }
    else {
        $("#lu-legend").slideUp(150);
        showSelected.style("fill", "rgb(255, 124, 81)");
        console.log("failed");
    }
});
