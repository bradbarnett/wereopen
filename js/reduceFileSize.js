/**
 * Created by Alicia on 11/28/16.
 */

var features;
var featuresHoursOnly = [];

d3.json("../data/places-with-hours.json", function (error, data) {
    features = data.features;
    // console.log(features);
    features.forEach(function (d) {
        var newFeature = {};
        newFeature.hours = []
        d.hours.forEach(function (e) {
            var newHours = {};
            newHours.openMinutes = e.start;
            newHours.closedMinutes = e.end;
            newFeature.hours.push(newHours);
        })
        newFeature.geometry = d.geometry;
        newFeature.properties = {};
        newFeature.type = d.type;
        newFeature.properties.reviews = d.properties.reviews;
        newFeature.properties.rating = d.properties.rating;
        newFeature.properties.metacategory = d.properties.metacategory;
        featuresHoursOnly.push(newFeature);
    })

    console.log(features.length);
    console.log(featuresHoursOnly.length);
    console.log(featuresHoursOnly);
    console.log(JSON.stringify(featuresHoursOnly));

})