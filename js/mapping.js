/**
 * Created by Alicia on 11/26/16.
 */

// Create leaflet map
var map = new L.Map("map", {
    center: new L.LatLng(42.357013, -71.092315),
    zoom: 13,
    zoomControl: true,
    opacity: .5,
    attributionControl: false
});

//Add base layer
var baseLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

map._initPathRoot();