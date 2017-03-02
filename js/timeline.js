/**
 * Created by Alicia on 1/21/17.
 */

var neighborhoodNames = [];

d3.json("../data/places-hours-neighborhoods.geojson", function (error, points) {
    if (error) throw error;
    points.features.forEach(function (d) {
        var neighborhood = d.properties.neighborhood;
        if (neighborhoodNames.indexOf(neighborhood) > -1) {

        }
        else if (neighborhood == null
            || neighborhood == "West Cambridge"
            || neighborhood == "North Cambridge"
            || neighborhood == "Hyde Park"
            || neighborhood == "West Roxbury"
            || neighborhood == "Mattapan"
            || neighborhood == "North Cambridge"
            || neighborhood == "Roslindale"
            || neighborhood == "East Cambridge") {
        }
        else {
            neighborhoodNames.push(neighborhood);
        }
    })
    neighborhoodNames.sort();
    console.log(neighborhoodNames);
    chartSetup();
})


var _data = {};

var svgChart = d3.select("#total").append("svg"),
    w = document.getElementById('line-chart').clientWidth,
    h = 300,
    margin = {top: 20, right: 20, bottom: 20, left: 40},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
svgChart.attr("height", h);


function chartSetup() {
    neighborhoodNames.forEach(function (d, i) {
        var humanReadableName = d;
        var name = d.replace(/\s+/g, '');
        // var div = d3.select("#line-chart").append("div").attr("id",name).attr("class","chart-container");
        // var title = div.append("div").attr("class","section-title").text(name);
        createChart(name);
        createLegend(name, i,humanReadableName);
        addNeighborhoods(name);
        // console.log(_totals);
    })

}



function convertToDate(d) {
    d.convertedDate = new Date(d.date);
    // console.log(d.convertedDate);
}

// var colors = ["#FF7C51","#34B248","#C741A7","#F1DB36","#9C0E15","#00A1D8"];
var colors = d3.scaleOrdinal(d3.schemeCategory10);

function runExample() {
    resetLineChart(name);
    neighborhoodNames.forEach(function (d, i) {
        var name = d.replace(/\s+/g, '');
        var _n = 40,
            _random = d3.randomNormal(0, .2);
        _data[name] = d3.range(_n).map(_random);
        example(name, i);
    })
}

function continueExample() {
    // resetLineChart(name);
    neighborhoodNames.forEach(function (d, i) {
        var name = d.replace(/\s+/g, '');

        resumeExample(name, i);
    })
}

function createLegend(name, i, humanReadableName) {
    var color = colors(i);
    var div = d3.select("#legend")
        .append("div")
        .attr("class", "legend-div")
        .attr("id",name);
    var svg = div.append("svg").attr("class", "legend-svg");
    var line = svg.append("rect")
        .attr("width", 10)
        .attr("height", 2)
        .attr("x", 0)
        .attr("y", 8)
        .style("fill", function () {
            return color;
        });
    var text = svg.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("dy", ".35em")
        .attr("class", "legend-text")
        .text(function () {
            return humanReadableName;
        });
}

function createChart(name) {
    var nameID = "#" + name;
    // console.log(name);
    var n = 40,
        random = d3.randomNormal(0, .2),
        data = d3.range(n).map(random);

    function getNext() {
        return _totalActive;
    }


    var g = svgChart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0, n - 1])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([0, 1000])
        .range([height, 0]);

    var line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d, i) {
            return y(d);
        });
    g.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    // g.append("g")
    //     .attr("class", "axis axis--x")
    //     .attr("transform", "translate(0," + y(0) + ")")
    //     .call(d3.axisBottom(x));
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(4));


}

function resetLineChart(name) {
    var nameID = "#" + name;
    // d3.select(nameID).selectAll("svg").remove();
    d3.select("#line-chart").selectAll("g").remove();
}

function example(name, i) {

    var color = colors(i);
    var nameID = "#" + name;
    var n = 40,
        random = d3.randomNormal(0, .2),
        data = d3.range(n).map(random);
    // console.log(data);
    function getNext() {
        // console.log(_totals[name]);
        return _totals[name];
    }

    // var svg = d3.select(nameID).append("svg"),
    //     w = document.getElementById('line-chart').clientWidth;
    // h = 150;
    // margin = {top: 20, right: 20, bottom: 20, left: 40},
    //     width = w - margin.left - margin.right,
    //     height = h - margin.top - margin.bottom,
    var g = svgChart.append("g").attr("id", name).attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0, n - 1])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([0, 1000])
        .range([height, 0]);

    var line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d, i) {
            return y(d);
        });
    g.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    // g.append("g")
    //     .attr("class", "axis axis--x")
    //     .attr("transform", "translate(0," + y(0) + ")")
    //     .call(d3.axisBottom(x));
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(4));

    g.append("g")
        .attr("clip-path", "url(#clip)")
        .attr("class", "clip-path")
        .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("id",name)
        .style("stroke", function () {
            return color;
        })
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .on("start", tick);

    // function checkThenTick(d) {
    //     if (_pause == false) {
    //         return tick();
    //     }
    //     else {
    //         console.log("paused");
    //         }
    //     }

    function tick() {
        getNext();
        // Push a new data point onto the back.
        data.push(getNext());
        _data[name].push(getNext());
        // Redraw the line.
        d3.select(this)
            .attr("d", line)
            .attr("transform", null);
        // Slide it to the left.
        d3.active(this)
            .attr("transform", "translate(" + x(-1) + ",0)")
            .transition()
            .on("start", tick);
        // Pop the old data point off the front.
        data.shift();
        _data[name].shift();
    }
}

function resumeExample(name, i) {

    var color = colors(i);
    var nameID = "#" + name;
    var n = 40,
        random = d3.randomNormal(0, .2),
        data = _data[name];

    function getNext() {
        // console.log(_totals[name]);
        return _totals[name];
    }

    // var svg = d3.select(nameID).append("svg"),
    //     w = document.getElementById('line-chart').clientWidth;
    // h = 150;
    // margin = {top: 20, right: 20, bottom: 20, left: 40},
    //     width = w - margin.left - margin.right,
    //     height = h - margin.top - margin.bottom,
    var g = svgChart.select(nameID);

    var x = d3.scaleLinear()
        .domain([0, n - 1])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([0, 1000])
        .range([height, 0]);

    var line = d3.line()
        .curve(d3.curveNatural)
        .x(function (d, i) {
            return x(i);
        })
        .y(function (d, i) {
            return y(d);
        });
    // g.append("defs").append("clipPath")
    //     .attr("id", "clip")
    //     .append("rect")
    //     .attr("width", width)
    //     .attr("height", height);
    // g.append("g")
    //     .attr("class", "axis axis--x")
    //     .attr("transform", "translate(0," + y(0) + ")")
    //     .call(d3.axisBottom(x));
    // g.append("g")
    //     .attr("class", "axis axis--y")
    //     .call(d3.axisLeft(y).ticks(4));

    g.select(".clip-path")
        .select("path")
        .datum(data)
        .style("stroke", function () {
            return color;
        })
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .on("start", tick);

    // function checkThenTick(d) {
    //     if (_pause == false) {
    //         return tick();
    //     }
    //     else {
    //         console.log("paused");
    //         }
    //     }

    function tick() {
        getNext();
        // Push a new data point onto the back.
        data.push(getNext());
        _data[name].push(getNext());
        // Redraw the line.
        d3.select(this)
            .attr("d", line)
            .attr("transform", null);
        // Slide it to the left.
        d3.active(this)
            .attr("transform", "translate(" + x(-1) + ",0)")
            .transition()
            .on("start", tick);
        // Pop the old data point off the front.
        data.shift();
        _data[name].shift();
    }
}





createChart();

