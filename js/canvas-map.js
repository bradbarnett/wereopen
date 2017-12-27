// // Create leaflet map
// var map = new L.Map("map", {
//     center: new L.LatLng(42.357013, -71.092315),
//     zoom: 13,
//     zoomControl: true,
//     opacity: .5,
//     attributionControl: false
// });
//
// //Add base layer
// var baseLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
//     attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
//     maxZoom: 19
// }).addTo(map);

d3.select("#thirty").style("opacity", 0);
d3.select("#percent-number").append("text").text("0%")
window.odometerOptions = {
    duration: 1000, // Change how long the javascript expects the CSS animation to take
    animation: 'count' // Count is a simpler animation method which just increments the value,
                       // use it when you're looking for something more subtendingView
}

var startingView = {
    center: [-71.07552688143727, 42.342176134268215],
    zoom: 10.5,
    bearing: 0,
    pitch: 0
}
var endingView = {
    center: [-71.07552688143727, 42.342176134268215],
    zoom: 12.428652455981558,
    bearing: 8.096261165865371,
    pitch: 38.999999999999936

}

var isAtStart = true;

mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhZHJiYXJuZXR0IiwiYSI6ImNqNGJhYnR6NjA4N2MzMnFwOWs2NjZ5ZzUifQ.ZtaKJSasjfx5Pl5D3raQkQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/bradrbarnett/cj5r5xhgf2duy2rl8bqc4juyy',
    center: [-71.07552688143727, 42.342176134268215],
    // zoom: startingView.zoom,
    // bearing: startingView.bearing,
    // pitch: startingView.pitch,
    zoom: startingView.zoom,
    bearing: startingView.bearing,
    pitch: startingView.pitch,
    attributionControl: false
});


document.getElementById('flyTo').addEventListener('click', function() {
    // depending on whether we're currently at point a or b, aim for
    // point a or b
    var target = isAtStart ? endingView : startingView;

    // and now we're at the opposite point
    isAtStart = !isAtStart;

    map.flyTo({
        // These options control the ending camera position: centered at
        // the target, at zoom level 9, and north up.
        center: target.center,
        zoom: target.zoom,
        bearing: target.bearing,
        pitch: target.pitch,
        // These options control the flight curve, making it move
        // slowly and zoom out almost completely before starting
        // to pan.
        speed: 0.1, // make the flying slow
        curve: 1, // change the speed at which it zooms out

        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: function (t) {
            return t;
        }
    });
});

var flying = false;

map.on('flystart', function(){
    flying = true;
});
map.on('flyend', function(){
    flying = false;
});

map.on('moveend', function(e){
    if(!flying){
        runViz();
    }
});

//
// map.on('load', function() {
//     map.addLayer({
//         'id': '3d-buildings',
//         'source': 'composite',
//         'source-layer': 'building',
//         'filter': ['==', 'extrude', 'true'],
//         'type': 'fill-extrusion',
//         'minzoom': 10,
//         'paint': {
//             'fill-extrusion-color': '#aaa',
//             'fill-extrusion-height': {
//                 'type': 'identity',
//                 'property': 'height'
//             },
//             'fill-extrusion-base': {
//                 'type': 'identity',
//                 'property': 'min_height'
//             },
//             'fill-extrusion-opacity': .6
//         }
//     });
// });
//General Settings
var bbox = document.body.getBoundingClientRect(); //get size of window
var container = map.getCanvasContainer() //function to return the html element containing the map's canvas element
var time = 300;
var runTime = 500;
var previousTime;
var date = new Date(2017, 0, 16, 5, 0, 0, 0);

//Items for first canvas (first half of dataset)
var canvas = d3.select(container).append("canvas").node(); //adds the canvas
canvas.width = bbox.width;
canvas.height = bbox.height;
var context = canvas.getContext('2d');
var detachedContainer = document.createElement("custom");
var dataContainer = d3.select(detachedContainer);

//Items for second canvas (second half of dataset)
var canvas2 = d3.select(container).append("canvas").attr("id", "canvas2").node();
canvas2.width = bbox.width;
canvas2.height = bbox.height;
var context2 = canvas2.getContext('2d');
var detachedContainer2 = document.createElement("custom2");
var dataContainer2 = d3.select(detachedContainer2);
var oldHour = 5;


//Utility Functions
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

function createCustomElements(data, version) {
    var dataCon = version;
    var selector = (version == dataContainer) ? "custom" : "custom2";

    var dataBinding = dataCon.selectAll(selector + ".circle")
        .data(data);

    // dataBinding
    //     .attr("size", 0);

    dataBinding.enter()
        .append(selector)
        .attr("class", "circle")
        .attr("x", function (d) {
            return d.LngLat.lng;
        })
        .attr("y", function (d) {
            return d.LngLat.lat;
        })
        .attr("lineWidth", 0.01)
        .attr("size", 0)
        .attr("fillStyle", "rgba(235,255,255,0.075)")
        .attr("strokeStyle", "transparent");
}

function renderCanvasElements(version, startTime) {
    var context = version;

    function project(d) {
        return map.project(d);
    }

    context.clearRect(0, 0, bbox.width, bbox.height)
    var selector = (version == context2) ? "custom2.circle" : "custom.circle";
    var dataCon = (version == context2) ? dataContainer2 : dataContainer;

    // select our dummy nodes and draw the data to canvas.
    var elements = dataCon.selectAll(selector);
    var scaleStroke = d3.scaleLinear().domain(d3.extent(elements, function (d) {
        return d.properties.reviews
    })).range([1, 2]);
    elements.each(function (d, i) {
        var node = d3.select(this);
        var ll = new mapboxgl.LngLat(node.attr("x"), node.attr("y"))
        var LL = project(ll);
        context.beginPath();
        // context.opacity = node.attr("opacity");
        context.fillStyle = node.attr("fillStyle");
        context.lineWidth = node.attr("lineWidth");
        context.strokeStyle = node.attr("strokeStyle");
        context.arc(LL.x, LL.y, node.attr("size"), 0, Math.PI * 2)
        context.fill();
        context.stroke();
    })
}

d3.json(path + "data/places-hours-neighborhoods-copy.json", function (error, points) {
    if (error) throw error;


    var pointData = points.features.filter(function (d) {
        return d.properties.neighborhood !== null;
    });

    //assign leaflet latlon from coordinates
    pointData.forEach(function (d, i) {
        d.indexID = i;
        // console.log(d.hours.length);
        if (d.geometry.coordinates[1] === null) {
            d.LngLat = new mapboxgl.LngLat(0, 0);
        }
        else {
            d.LngLat = new mapboxgl.LngLat(d.geometry.coordinates[0], d.geometry.coordinates[1])
        }
    })

    //put larger dots on bottom
    pointData.sort(function (a, b) {
        return b.properties.reviews - a.properties.reviews;
    });

    var pointDataFirstHalf = pointData.filter(function (d, i) {
        return i > (pointData.length / 2);
    })

    var pointDataSecondHalf = pointData.filter(function (d, i) {
        return i <= (pointData.length / 2);
    })


    // console.log("forEach is done");


    createCustomElements(pointDataFirstHalf, dataContainer);
    createCustomElements(pointDataSecondHalf, dataContainer2);

    // re-renderCanvasElements our visualization whenever the view changes
    map.on("viewreset", function () {
        // createCustomElements(pointData);
        renderCanvasElements(context);

        renderCanvasElements(context2);
    })
    map.on("move", function () {
        // createCustomElements(pointData);
        renderCanvasElements(context);
        renderCanvasElements(context2);
    })


    d3.select("#datestamp").on("click", function () {
        runViz();

    })


})

function runViz() {
    var counter = 0;

    function runIntervals(startTime) {
        // console.log('countingFull')

        //
        if (startTime === undefined) {
            time = time;
        }
        else {
            time = startTime;
        }

        previousTime = time;
        time = time + 30;

        // console.log(time);
        // console.log(counter);


        showDateTime(date, time);
        if (counter > 1) {
            // console.log("Running Context 1");
            countingFull(context);
            counter = 0;
        }
        else {
            // console.log("Running Context 2");
            countingFull(context2);
            countingFull(context);
            counter += 1;
        }

        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var timeStop = startOfDay / 1000;
        if (time < timeStop) {
            timeOut = setTimeout(runIntervals, 3000);
            // counter += 1;
        }

        else return;
    }

    function countingFull(version, startTime) {


        // console.log('countingFull')
        var dataCon = (version == context) ? dataContainer : dataContainer2;
        var intervalTime = (version == context) ? 3000 : 6000;
        // var selectorColor = (version == context) ? "rgba(255,255,255,0.1)" : "rgba(76, 167, 247, 0.1)";
        // var strokeColor = (version == context) ? "rgba(255,255,255,.15)" : "rgba(76, 167, 247, 0.15)";
        var selector = (version == context) ? "custom.circle" : "custom2.circle";

        var customCircles = dataCon.selectAll(selector);
        var filtered = customCircles.filter(function (d) {
            return (
            d.hours[0].openMinutes < time && d.hours[0].closedMinutesCorrected > time ||
            d.hours[1].openMinutes < time && d.hours[1].closedMinutesCorrected > time ||
            d.hours[2].openMinutes < time && d.hours[2].closedMinutesCorrected > time ||
            d.hours[3].openMinutes < time && d.hours[3].closedMinutesCorrected > time ||
            d.hours[4].openMinutes < time && d.hours[4].closedMinutesCorrected > time ||
            d.hours[5].openMinutes < time && d.hours[5].closedMinutesCorrected > time ||
            d.hours[6].openMinutes < time && d.hours[6].closedMinutesCorrected > time);
        });
        // console.log("filtered: " + filtered._groups[0].length);

        var remaining = customCircles.filter(function (d) {
            return !(
            d.hours[0].openMinutes < time && d.hours[0].closedMinutesCorrected > time ||
            d.hours[1].openMinutes < time && d.hours[1].closedMinutesCorrected > time ||
            d.hours[2].openMinutes < time && d.hours[2].closedMinutesCorrected > time ||
            d.hours[3].openMinutes < time && d.hours[3].closedMinutesCorrected > time ||
            d.hours[4].openMinutes < time && d.hours[4].closedMinutesCorrected > time ||
            d.hours[5].openMinutes < time && d.hours[5].closedMinutesCorrected > time ||
            d.hours[6].openMinutes < time && d.hours[6].closedMinutesCorrected > time);
        });

        runTime = filtered._groups[0].length;
        d3.select("#percent-number").selectAll("text").remove();
        d3.select("#percent-number").append("text").text(function() {
            var number = (runTime/7809) * 100;
            if (number < 1 && number > 0) {
                number = 1;
            }
            return Math.round((runTime/7809) * 100) + "%"
        })
        var transitionScale = d3.scaleLog().domain([1, runTime]).range([50, (intervalTime / 1.4)])

        filtered
            .transition()
            .ease(d3.easeExpIn)
            .delay(function (d, i) {
                    // var duration = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
                    // console.log(duration);
                    var duration = transitionScale(i) + 50;
                    return duration;
                }
            )
            .duration(intervalTime)
            .attr("fillStyle", function (d, i) {
                return "rgba(235,255,255,0.075)"
            })
            // .attr("lineWidth",1)
            .attr("size", function (d) {
                return circleSize(d);
            })
        // .on("end", function () {
        //     d3.active(this)
        //         .transition()
        //         .duration(500)
        //         .attr("lineWidth", 0)
        //         .attr("strokeStyle", function (d, i) {
        //             return "rgba(235,255,255,0)"
        //         })
        // });


        remaining
            .transition()
            .duration(function (d, i) {
                // var duration = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
                // console.log(duration);
                var duration = transitionScale(i);
                return duration;
            })
            .attr("lineWidth", 0)
            .attr("size", 0);


        var t = d3.timer(function (elapsed) {
            renderCanvasElements(version);
            if (elapsed > intervalTime) t.stop();
        }); // Timer running the draw function repeatedly for 300 ms.


    }

    // countingFull(context2);

    // countingHalf();

    runIntervals();
}


function showDateTime(date, time) {

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
        d3.select("#datestamp").classed("zero", false);
    }
    else {
        d3.select("#datestamp").style("opacity", 1);
        // console.log(1);
    }
    ;
    var currentDay = date.getDay() - 1;
    currentDay = weekday[currentDay].toString();
    var currentHour = date.getHours();
    var currentMinutes = addZeroBefore(date.getMinutes()).toString();
    // var currentMinutes = (date.getMinutes() < 30) ? 100 : date.getMinutes();
    // console.log(currentMinutes);
    var dateString = date.toString();
    // lineChartData.push({date: dateString, val: _totalActive});
    var datestamp = document.getElementById("datestamp");
    // console.log("updated");
    var textCurrentMinutes = addZeroBefore(date.getMinutes());

    var twelveHour = 0;
    var ampm = "am";
    if (currentHour == 12) {
        twelveHour = 12;
        ampm = "pm";
    }
    else if (currentHour > 12) {
        twelveHour = currentHour - 12;
        ampm = "pm";
    }

    else {
        twelveHour = currentHour;
        ampm = "am";
    }

    // textBox.transition().duration(500)
    //     .text(function () {
    //         return currentDay + " " + addZeroBefore(twelveHour) + ":" + currentMinutes + ampm;
    //     });
    // datestamp.innerHTML = currentDay + " " + addZeroBefore(twelveHour) + ":" + currentMinutes + ampm;
    // datestamp.style.color = "white";

    d3.select(".time-span#day")._groups[0][0].innerHTML = currentDay;
    var durationTime = 500;
    if (currentMinutes == "00") {
        // d3.select("#colon").transition().duration(durationTime).style("opacity", 0).on("start", function () {
        //     d3.select("#colon").transition().delay(durationTime/2).duration(durationTime).style("opacity", 1)
        // })
        d3.select("#thirty").transition().duration(durationTime).style("opacity", 0).on("start", function () {
            d3.select("#zero").transition().duration(durationTime * 2).style("opacity", 1);
        })
    }
    else {

        d3.select("#zero").transition().duration(durationTime).style("opacity", 0).on("start", function () {
            d3.select("#thirty").transition().duration(durationTime * 2).style("opacity", 1);
        })
    }

    if (currentHour !== oldHour) {
        d3.select("#colon").transition().duration(durationTime).style("opacity", 0).on("start", function () {
            d3.select("#colon").transition().delay(durationTime/2).duration(durationTime).style("opacity", 1)
        })
        d3.select("#hour").transition().duration(durationTime).style("opacity", 0).on("start", function () {
            d3.select("#hour").transition().delay(durationTime/2).duration(durationTime).style("opacity", 1).on("start", function () {
                d3.select("#hour")._groups[0][0].innerHTML = addZeroBefore(twelveHour);
            });
        })
    }
    else {
        d3.select("#hour")._groups[0][0].innerHTML = addZeroBefore(twelveHour);
    }


    d3.select(".time-span#ampm")._groups[0][0].innerHTML = ampm;
    // console.log(oldHour);
    // console.log(currentHour);
    oldHour = currentHour;
}






