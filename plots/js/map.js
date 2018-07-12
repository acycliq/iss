function map(data)
{

    var map = L.map("map");
    L.tileLayer("../plots/data/img/dapi2/{z}/{x}/{y}.png", {
            minZoom: 1,
            maxZoom: 5,
            attribution: 'Attribution goes here',
            tms: true
        }).addTo(map);

    map.setView([0, 0], 4);

    var myRenderer = L.canvas({ padding: 0.5 });

    for (var i = 0; i < 100; i += 1) { // 100k points
        L.circleMarker([0,100], {
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
