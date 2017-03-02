function convertToMinutes(offset, time) {
    var hours = parseInt(time.slice(0, 2));
    var minutes = parseInt(time.slice(2, 4));
    var combined = offset + (hours * 60) + minutes;
    return combined;
}


function findMissingDay(CurrentArray, PreviousArray) {
    var CurrentArrSize = CurrentArray.length;
    var PreviousArrSize = PreviousArray.length;
    var missingDays = [];
    // loop through previous array
    for (var j = 0; j < PreviousArrSize; j++) {

        // look for same thing in new array
        if (CurrentArray.indexOf(PreviousArray[j]) == -1) {
            // console.log("MISSING: " + PreviousArray[j]);
            missingDays.push(PreviousArray[j]);
        }

    }
    return missingDays;
}


var features;

d3.json("../data/hours.json", function (error, data) {
    features = data.features;
    // console.log(features);
    var range = [0, 1, 2, 3, 4, 5, 6];
    features.forEach(function (d,i) {
        d.index = i;
        var days = [];
        d.hours.forEach(function (e) {
            days.push(e.day);
        })
        // console.log(days);
        var missing = findMissingDay(days, range);
        // console.log("=============");
        console.log(missing);


        d.hours.forEach(function (e) {
            var currentDay = e.day;
            var dayObject = e;
            if (dayObject) {
                // console.log(e)
                var dayOffset = dayObject.day * 1440;
                var start = dayObject.start;
                var end = dayObject.end;
                var openTime = convertToMinutes(dayOffset, start);
                var closeTime = convertToMinutes(dayOffset, end);
                dayObject.openMinutes = openTime;
                dayObject.closedMinutes = closeTime;
            }
        })

        missing.forEach(function (e) {
            if (missing != undefined) {
                // console.log("MISSED!");
                var newDay = {};
                newDay.is_overnight = false;
                newDay.day = e;
                newDay.end = 0;
                newDay.start = 0;
                newDay.openMinutes = 0;
                newDay.closedMinutes = 0;
                d.hours.push(newDay);
            }
        })
        
       // console.log(d.hours.length);
    })
    
    // console.log(features.length);
    // console.log(featuresWithHours.length);
    console.log("check123");
    console.log(JSON.stringify(features));

})


/*

 day 1
 start counter
 if  (d.convertedHours[0].start < currentTime && d.convertedHours[0].end > currentTime ||
 d.convertedHours[1].start < currentTime && d.convertedHours[1].end > currentTime ||
 d.convertedHours[2].start < currentTime && d.convertedHours[2].end > currentTime ||
 d.convertedHours[3].start < currentTime && d.convertedHours[3].end > currentTime ||
 d.convertedHours[4].start < currentTime && d.convertedHours[4].end > currentTime ||
 d.convertedHours[5].start < currentTime && d.convertedHours[5].end > currentTime ||
 d.convertedHours[6].start < currentTime && d.convertedHours[6].end > currentTime ||
 d.convertedHours[7].start < currentTime && d.convertedHours[7].end > currentTime) {


 */