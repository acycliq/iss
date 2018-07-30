function dapi(data) {

    d3.csv("./plots/data/myarr.csv", function (data) {
        data.forEach(function (d) {
            d.x = +d.x
            d.y = +d.y
            d.Expt = +d.Expt
        })
        renderChart(data)
    })

    function make_dots(data) {
        var arr = [];
        var nest = d3.nest()
            .key(function (d) {
                return Math.floor(d.Expt / 10);;
            })
            .entries(data);

        for (var k = 0; k < nest.length; ++k) {
            arr[k] = helper(nest[k].values);
        }
        return arr;
    }

    function helper(data) {
        dots = {
            type: "FeatureCollection",
            features: []
        };
        for (var i = 0; i < data.length; ++i) {
            x = data[i].x;
            y = data[i].y;
            var g = {
                "type": "Point",
                "coordinates": [x, y]
            };

            //create feature properties
            var p = {
                "id": i,
                "popup": "Dot_" + i,
                "year": parseInt(data[i].Expt),
                "size": 30
            };

            //create features with proper geojson structure
            dots.features.push({
                "geometry": g,
                "type": "Feature",
                "properties": p
            });
        }
        return dots;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    //styling and displaying the data as circle markers//
    //////////////////////////////////////////////////////////////////////////////////////////////

    //create color ramp
    function getColor(y) {
        return y > 90 ? '#6068F0' :
            y > 80 ? '#6B64DC' :
            y > 70 ? '#7660C9' :
            y > 60 ? '#815CB6' :
            y > 50 ? '#8C58A3' :
            y > 40 ? '#985490' :
            y > 30 ? '#A3507C' :
            y > 20 ? '#AE4C69' :
            y > 10 ? '#B94856' :
            y > 0 ? '#C44443' :
            '#D04030';
    }

    //calculate radius so that resulting circles will be proportional by area
    function getRadius(y) {
        r = Math.sqrt(y / Math.PI)
        return r;
    }

    // This is very important! Use a canvas otherwise the chart is too heavy for the browser when
    // the number of points is too high, as in this case where we have around 300K points to plot
    var myRenderer = L.canvas({
        padding: 0.5
    });

    //create style, with fillColor picked from color ramp
    function style(feature) {
        return {
            radius: getRadius(feature.properties.size),
            fillColor: getColor(feature.properties.year),
            color: "#000",
            weight: 0,
            opacity: 1,
            fillOpacity: 0.9,
            renderer: myRenderer
        };
    }

    //create highlight style, with darker color and larger radius
    function highlightStyle(feature) {
        return {
            radius: getRadius(feature.properties.size) + 1.5,
            fillColor: "#FFCE00",
            color: "#FFCE00",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
        };
    }

    //attach styles and popups to the marker layer
    function highlightDot(e) {
        var layer = e.target;
        dotStyleHighlight = highlightStyle(layer.feature);
        layer.setStyle(dotStyleHighlight);
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
    }

    function resetDotHighlight(e) {
        var layer = e.target;
        dotStyleDefault = style(layer.feature);
        layer.setStyle(dotStyleDefault);
    }

    function onEachDot(feature, layer) {
        layer.on({
            mouseover: highlightDot,
            mouseout: resetDotHighlight
        });
        var popup = '<table style="width:110px"><tbody><tr><td><div><b>Marker:</b></div></td><td><div>' + feature.properties.popup + 
            '</div></td></tr><tr class><td><div><b>Group:</b></div></td><td><div>' + feature.properties.year + 
            '</div></td></tr><tr><td><div><b>X:</b></div></td><td><div>' + feature.geometry.coordinates[0] + 
            '</div></td></tr><tr><td><div><b>Y:</b></div></td><td><div>' + feature.geometry.coordinates[1] + 
            '</div></td></tr></tbody></table>'
        
        layer.bindPopup(popup);
    }





    function renderChart(data) {
        var myDots = make_dots(data);
        var yx = L.latLng;

        var xy = function (x, y) {
            if (L.Util.isArray(x)) { // When doing xy([x, y]);
                return yx(x[1], x[0]);
            }
            return yx(y, x); // When doing xy(x, y);
        };

        var minZoom = 0,
            maxZoom = 6,
            img = [
            16384, // original width of image => x / ~longitude (0 is left, 16384 is right)
            12288 // original height of image => y / ~ reverse of latitude (0 is top, 12288 is bottom)
            ];

        var bounds = L.latLngBounds([
                xy(0, 0),
                xy(img)
            ]);

        var grid = {
            x0: 6150, // range of plot in Matlab
            x1: 13751,
            y0: 12987,
            y1: 18457
        };

        // project pixel p from image img on the a user-defined range
        // Projection has origin [0,0] the bottom left corner
        function project(p, img, grid) {
            var x = p[0],
                y = p[1];
            xx = img[0] / (grid.x1 - grid.x0) * (x - grid.x0);
            yy = img[1] - img[1] / (grid.y1 - grid.y0) * (y - grid.y0);

            return [xx, yy]
        }



        L.CRS.MySimple = L.extend({}, L.CRS.Simple, {
            //                      coefficients: a      b    c     d
            transformation: new L.Transformation(1 / 64, 0, 1 / 64, 64) // Compute a and c coefficients so that  tile 0/0/0 is
            // from [0, 0] to [16384, 12288]. For example, we calc c and d making sure that equation
            // 256 = c*12288 + d holds. 256 is the tile size and 12288 the original height of the image (in pixels)
        });


        var map = L.map('map', {
            crs: L.CRS.MySimple, // http://leafletjs.com/reference-1.0.3.html#map-crs
            maxBounds: bounds.pad(.5), // http://leafletjs.com/reference-1.0.3.html#map-maxbounds
            minZoom: minZoom,
            maxZoom: maxZoom
        }).setView([img[1] / 2, img[0] / 2], 5);

        L.tileLayer("./plots/data/img/dapi/{z}/{x}/{y}.png", {
            attribution: 'KDH',
            continuousWorld: false,
            minZoom: 0,
            noWrap: true
        }).addTo(map);

        //map.setView([55, 20], 6);

        var myRenderer = L.canvas({
            padding: 0.5
        });

        // Define an array to keep layerGroups
        var dotlayer = [];

        //create marker layer and display it on the map
        for (var i = 0; i < myDots.length; i += 1) {
            dotlayer[i] = L.geoJson(myDots[i], {
                pointToLayer: function (feature, latlng) {
                    var p = xy(project([latlng.lng, latlng.lat], img, grid));
                    return L.circleMarker(p, style(feature));
                },
                onEachFeature: onEachDot
            }).addTo(map);
        }


        var cl = L.control.layers(null, {}).addTo(map);
        for (j = 0; j < dotlayer.length; j += 1) {
            var name = "Group " + j + "0-" + j + "9";
            cl.addOverlay(dotlayer[j], name);
        }

        ////////////////////////////////////////////////////////////////////////////
        // FlyTo
        ////////////////////////////////////////////////////////////////////////////

        var fly1 = document.getElementById("xValue");
        var fly2 = document.getElementById("yValue");
        //var container = document.getElementById("container");

        fly1.addEventListener("change", function (event) {
            event.preventDefault();
            x = +document.getElementById("xValue").value
            y = +document.getElementById("yValue").value
            p = xy(project([x, y], img, grid))
            map.flyTo(p, 5);
        });

        fly2.addEventListener("change", function (event) {
            event.preventDefault();
            x = +document.getElementById("xValue").value
            y = +document.getElementById("yValue").value
            p = xy(project([x, y], img, grid))
            map.flyTo(p, 5);
        });


        ////////////////////////////////////////////////////////////////////////////
        // Using Leaflet.Coordinates plugin at https://github.com/MrMufflon/Leaflet.Coordinates
        // As done in https://stackoverflow.com/questions/34638887/leaflet-custom-coordinates-on-image
        ////////////////////////////////////////////////////////////////////////////

        // Patch first to avoid longitude wrapping.
        L.Control.Coordinates.include({
            _update: function (evt) {
                var pos = evt.latlng,
                    opts = this.options;
                if (pos) {
                    //pos = pos.wrap(); // Remove that instruction.
                    this._currentPos = pos;
                    this._inputY.value = L.NumberFormatter.round(pos.lat, opts.decimals, opts.decimalSeperator);
                    this._inputX.value = L.NumberFormatter.round(pos.lng, opts.decimals, opts.decimalSeperator);
                    this._label.innerHTML = this._createCoordinateLabel(pos);
                }
            }
        });


        L.control.coordinates({
            position: "bottomleft",
            decimals: 0, //optional default 4
            decimalSeperator: ".", //optional default "."
            labelTemplateLat: "Y: {y}", //optional default "Lat: {y}"
            labelTemplateLng: "X: {x}", //optional default "Lng: {x}"
            enableUserInput: false, //optional default true
            useDMS: false, //optional default false
            useLatLngOrder: false, //ordering of labels, default false-> lng-lat
            markerType: L.marker, //optional default L.marker
            markerProps: {} //optional default {}
        }).addTo(map);

    }
}
