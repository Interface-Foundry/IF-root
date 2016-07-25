var map = L.map('map').setView([40.7384012, -73.9878516], 13);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);

// using window.trajectories

var points = trajectories.reduce(function(p, c) {
    return p.concat(c);
}, []);


var heat = L.heatLayer(points, { radius: 5}).addTo(map);