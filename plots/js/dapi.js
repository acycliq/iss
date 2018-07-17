function dapi(data) {

    d3.csv("./data/myarr.csv", function(data){
        data.forEach(function(d){
            d.x = +d.x
            d.y = +d.y
        })

    ////////////////////////////////////////////////////////////////////////////
    // Conversion from (x, y) raster image coordinates to equivalent of latLng
    // Taken from Leaflet tutorial "Non-geographical maps"
    // http://leafletjs.com/examples/crs-simple/crs-simple.html
    ////////////////////////////////////////////////////////////////////////////
    var yx = L.latLng;

    var xy = function (x, y) {
        if (L.Util.isArray(x)) { // When doing xy([x, y]);
            return yx(x[1], x[0]);
        }
        return yx(y, x); // When doing xy(x, y);
    };

    var minZoom = 0;
    var maxZoom = 6;
    var img = [
            16384, // original width of image => x / ~longitude (0 is left, 16384 is right)
            12288 // original height of image => y / ~ reverse of latitude (0 is top, 12288 is bottom)
        ];

    /**
     * Tile 0/0/0 is 256 x 256 px, and so are all other tiles.
     * See https://stackoverflow.com/questions/34638887/leaflet-custom-coordinates-on-image
     * http://leafletjs.com/reference-1.0.3.html#transformation
     * 256 px * 2^4 = 4096 px
     */

    L.CRS.MySimple = L.extend({}, L.CRS.Simple, {
        //                      coefficients: a      b    c     d
        transformation: new L.Transformation(1 / 64, 0, 1 / 64, 64) // Compute a and c coefficients so that  tile 0/0/0 is
        // from [0, 0] to [16384, 12288]. For example, we calc c and d making sure that equation
        // 256 = c*12288 + d holds. 256 is the tile size and 12288 the original height of the image (in pixels)
    });

    var bounds = L.latLngBounds([
            xy(0, 0),
            xy(img)
        ]);


    //        var mapSW = [0, 16384],
    //            mapNE = [16384, 0];

    var map = L.map('map', {
        crs: L.CRS.MySimple, // http://leafletjs.com/reference-1.0.3.html#map-crs
        maxBounds: bounds.pad(.5), // http://leafletjs.com/reference-1.0.3.html#map-maxbounds
        minZoom: minZoom,
        maxZoom: maxZoom
    }).setView([img[1]/2, img[0]/2], 5);

    L.tileLayer('./data/img/dapi/{z}/{x}/{y}.png', {
        bounds: bounds,
        attribution: 'KDH',
        continuousWorld: false,
        noWrap: true
    }).addTo(map);

    //        map.setMaxBounds(new L.LatLngBounds(
    //            map.unproject(mapSW, map.getMaxZoom()),
    //            map.unproject(mapNE, map.getMaxZoom())
    //            ))

    //Markers and popups
    //LatLng
    var marker = L.marker([0, 0], {
        draggable: false,
    }).addTo(map);
    marker.bindPopup("");

    var grid = {
        x0: 6150, // range of plot in Matlab
        x1: 13751,
        y0: 12987,
        y1: 18457
    }


    //var marker = L.circleMarker(map.unproject([0, 0], map.getMaxZoom())).addTo(map);

    //        marker.on('dragend', function(e) {
    //            marker.getPopup().setContent('Clicked' + marker.getLatLng().toString() + '<br />'
    //                + 'Pixels ' + map.project(marker.getLatLng(), map.getMaxZoom().toString()))
    //            .openOn(map);
    //        });

    ////////////////////////////////////////////////////////////////////////////
    // FlyTo
    ////////////////////////////////////////////////////////////////////////////

    var fly1 = document.getElementById("fly1");
    var fly2 = document.getElementById("fly2");
    var container = document.getElementById("container");

    //        fly1.addEventListener("click", function(event) {
    //            event.preventDefault();
    //            map.flyTo(xy(0, 0));
    //        });
    //
    //        fly2.addEventListener("click", function(event) {
    //            event.preventDefault();
    //            map.flyTo(xy(img));
    //        });


    // add layer control object
    L.control.layers({}, {
        //'Polygon': layerPolygon(map), // no longer need for rc, using xy conversion instead
        //'Countries': layerCountries(map),
        'Bounds': layerBounds(map, img, grid),
        //'Info': layerGeo(map)
    }, {
        collapsed: false
    }).addTo(map)


    // project pixel p from image img on the a user-defined range
    // Projection has origin [0,0] the bottom left corner
    function project(p, img, grid) {
        var x = p[0],
            y = p[1];
        xx = img[0] / (grid.x1 - grid.x0) * (x - grid.x0);
        yy = img[1] - img[1] / (grid.y1 - grid.y0) * (y - grid.y0);

        return [xx, yy]
    }

    var myRenderer = L.canvas({
        padding: 0.5
    });

    for (var i = 0; i < data.length; i += 1) { // 100k points
        p = [data[i].x, data[i].y];
        L.circleMarker(xy(project(p, img, grid)), {
            renderer: myRenderer
        }).addTo(map).bindPopup('marker ' + i);
    }

    /**
     * layer with markers
     */
    function layerBounds(map, img, grid) {
        var p = [10000, 18457];
        // set marker at the image bound edges
        var layerBounds = L.layerGroup([
                L.marker(xy([0, 0])).bindPopup('[0,0]'), // Just use xy conversion instead of rc.unproject
                L.marker(xy(img)).bindPopup(JSON.stringify(img)), // Just use xy conversion instead of rc.unproject
                L.circleMarker(xy(project(p, img, grid)), {
                renderer: myRenderer
            }).bindPopup(JSON.stringify(p))
                ])
        map.addLayer(layerBounds)

        // set markers on click events in the map
        map.on('click', function (event) {
            // to obtain raster coordinates from the map use `project` => no longer needed!
            var coord = event.latlng;
            // to set a marker, ... in raster coordinates in the map use `unproject` => no longer needed!
            var marker = L.marker(coord)
                .addTo(layerBounds)
            marker.bindPopup(coord.toString() + "<br />x: " + coord.lng + "<br />y: " + coord.lat)
                .openPopup()
        })

        return layerBounds
    }
})
}
