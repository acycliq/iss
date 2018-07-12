function map(data)
{
    var map = L.map("map");
    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(map);

    map.setView([48.85, 2.35], 8);

    var myRenderer = L.canvas({ padding: 0.5 });

    for (var i = 0; i < 100000; i += 1) { // 100k points
        L.circleMarker(getRandomLatLng(), {
        renderer: myRenderer
      }).addTo(map).bindPopup('marker ' + i);
    }

    function getRandomLatLng() {
        return [
        -90 + 180 * Math.random(),
        -180 + 360 * Math.random()
      ];
    }

}
