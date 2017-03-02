/**
 * Created by Alicia on 2/4/17.
 */

console.log("starting...")
d3.queue()
    .defer(d3.json, "../data/places-with-hours.json")
    .defer(d3.json, "../data/places-updated.json")
    .await(function(error,data1,data2) {
        if (error) return error;
        console.log("test");
        var features1 = data1.features;
        var features2 = data2.features;
        testArrays(features1,features2);
    });


function testArrays(a,b) {

    for(i=0;i<a.length;i++){
        a[i].properties.neighborhood = "none";
        // console.log(a[i].properties);
        for(j=0;j<b.length;j++){
            // console.log(b[j].properties);
            if(b[j].properties.id == a[i].properties.id){
                a[i].properties.neighborhood = b[j].properties.bosName
            }
        }
    }

    console.log(JSON.stringify(a))
}
