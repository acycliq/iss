function dapi(cellData) {

    
    var img = [
        65536, // original width of image
        47168 // original height of image
    ];

    var roi = { //range of interest
        x0: 6150,
        x1: 13751,
        y0: 12987,
        y1: 18457
    };

    a = img[0] / (roi.x1 - roi.x0)
    b = -img[0] / (roi.x1 - roi.x0) * roi.x0
    c = img[1] / (roi.y1 - roi.y0)
    d = -img[1] / (roi.y1 - roi.y0) * roi.y0
    
    var glyphs = glyphAssignment();
    var glyphMap = d3.map(glyphs, function(d) { return d.gene; });

    // This transformation maps a point in pixel dimensions to our user defined roi
    var t = new L.Transformation(a, b, c, d);

    function make_dots(data) {
        var arr = [];
        var nest = d3.nest()
            .key(function (d) {
                return Math.floor(d.Expt / 10);
            })
            .entries(data);

        for (var k = 0; k < nest.length; ++k) {
            arr[k] = helper(nest[k].values, "Gene");
        }
        return arr;
    }

    function helper(data, label) {
        var dots = {
            type: "FeatureCollection",
            features: []
        };
        for (var i = 0; i < data.length; ++i) {
            x = data[i].x;
            y = data[i].y;
            gene = data[i].Gene;
            //console.log(gene)
            var lp = t.transform(L.point([x, y]));
            var g = {
                "type": "Point",
                "coordinates": [lp.x, lp.y]
            };

            //create feature properties
            var p = {
                "id": i,
                "x": x,
                "y": y,
                "Gene": gene,
                "taxonomy": glyphMap.get(gene).taxonomy,
                "glyphName": glyphMap.get(gene).glyphName,
                "popup": label + " " + i,
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
    
    
    function makeCellFeatures(data) {
        var dots = {
            type: "FeatureCollection",
            features: []
        };
        for (var i = 0; i < data.length; ++i) {
            x = data[i].x;
            y = data[i].y;
            var lp = t.transform(L.point([x, y]));
            var g = {
                "type": "Point",
                "coordinates": [lp.x, lp.y]
            };

            //create feature properties
            var p = {
                "id": i,
                "x": x,
                "y": y,
                "popup": "Cell " + i,
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
        return y === 'cnr1' ? '#FFC700' :
            y === 'cxcl14' ? '#00B2FF' :
            y === 'in_general' ? '#5C33FF' :
            y === 'less_active' ? '#407F59' :
            y === 'ngf' ? '#44B200' :
            y === 'non_neuron' ? '#00FF00' :
            y === 'pc' ? '#FFFFFF' :
            y === 'pc2' ? '#FF00E5' :
            y === 'pc_or_in' ? '#96B28E' :
            y === 'pvalb' ? '#0000FF' :
            y === 'sst' ? '#995C00' :
            y === 'vip' ? '#FF0000' :
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
            //fillColor: "none",//getColor(feature.properties.taxonomy),
            color: getColor(feature.properties.taxonomy),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.0,
            renderer: myRenderer
        };
    }

    //create highlight style, with darker color and larger radius
    function highlightStyle(feature) {
        return {
            radius: getRadius(feature.properties.size) * 2,
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
            '</div></td></tr><tr><td><div><b>X:</b></div></td><td><div>' + feature.properties.x + 
            '</div></td></tr><tr><td><div><b>Y:</b></div></td><td><div>' + feature.properties.y + 
            '</div></td></tr></tbody></table>'
        
        layer.bindPopup(popup);
    }
    
    
    d3.csv("./plots/data/Dapi_overlays.csv", function (data) {
        data.forEach(function (d) {
            d.x = +d.x
            d.y = +d.y
            d.Expt = +d.Expt
        })
        renderChart(data, cellData)
    })    


    function renderChart(data, cellData) {
        var myDots = make_dots(data);
        var yx = L.latLng;

        var xy = function (x, y) {
            if (L.Util.isArray(x)) { // When doing xy([x, y]);
                return yx(x[1], x[0]);
            }
            return yx(y, x); // When doing xy(x, y);
        };

        var minZoom = 0,
            maxZoom = 8;

        // The transformation in this CRS maps the the bottom left corner to (0,0) and the top right to (256, 256)
        L.CRS.MySimple = L.extend({}, L.CRS.Simple, {
            transformation: new L.Transformation(1 / 256, 0, -1 / 256, 256),
        });

        var bounds = L.latLngBounds([
            xy(0, 0),
            xy(img)
        ]);


        var map = L.map('map', {
            crs: L.CRS.MySimple, // http://leafletjs.com/reference-1.0.3.html#map-crs
            maxBounds: bounds.pad(.5), // http://leafletjs.com/reference-1.0.3.html#map-maxbounds
            minZoom: minZoom,
            maxZoom: maxZoom
        }).setView([img[1] / 2, img[0] / 2], 5);

        L.tileLayer("./plots/data/img/65536px/{z}/{x}/{y}.png", {
            attribution: 'KDH',
            continuousWorld: false,
            minZoom: 0,
            noWrap: true
        }).addTo(map);
        
        //Minimap plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls
        tl = L.tileLayer("./plots/data/img/65536px/{z}/{x}/{y}.png", {
            minZoom: 0,
            maxZoom: 6
        });
        var miniMap = new L.Control.MiniMap(tl, { toggleDisplay: true }).addTo(map);
        
        //Add fullscreen button
        map.addControl(new L.Control.Fullscreen());


        // Voronoi
        var cellDots = makeCellFeatures(cellData);
        var cellFeatures = cellDots.features;
        var fc = turf.featureCollection(cellFeatures)
        var voronoiPolygons = turf.voronoi(fc, {bbox: [0, 0, img[0], img[1]]});
        var voronoiLayer = L.geoJSON(voronoiPolygons, {style: function(feature) {
            return {
                weight: 0.0, // Voronoi not visible, useful only for navigation purposes
                color: 'tomato',
                opacity: 0.5,
                fill: false,
                dashArray: "4 1",
                renderer: myRenderer
            };
        },
            onEachFeature: function(feature, layer) {
            layer.on(
                {
                    'mousemove': function(e){e.target.setStyle({weight:0.0, color: 'red'})},
                    'mouseout': function(e){voronoiLayer.resetStyle(e.target); this.closePopup()},
                    'click': function(e){
                        map.fitBounds(e.target.getBounds());
                        this.bindPopup("<b>"+"Hello");
                        },
                    'add': function(e){console.log('add pressed')},
                    'remove': function(e){console.log('remove pressed')},
                }
            );//close layer
            }

        }).addTo(map);
        
        
        var cellLayer = L.geoJSON(fc, {
            pointToLayer: function (feature, latlng){
                console.log("hello")
                return L.circleMarker(latlng, style(feature));
            },
            onEachFeature: onEachDot
        }).addTo(map);


        //var cl = L.control.layers(null, {}).addTo(map);


        // Define an array to keep layers
        var dotlayer = [];

        //create marker layer and display it on the map
        for (var i = 0; i < myDots.length; i += 1) {
            dotlayer[i] = L.geoJson(myDots[i], {
                pointToLayer: function (feature, latlng) {
                    //var p = xy(project([latlng.lng, latlng.lat], img, grid));
                    //return L.circleMarker(p, style(feature));
                    // return new MarkerStar(p, style(feature));
                    
                    return new svgMarker[i].value(latlng, style(feature));
                },
                onEachFeature: onEachDot
            });
        }
        
        
        // Keep these layers on a single layer group and call this to add them to the map
        var lg = new L.LayerGroup();
        function addLayers(){
            for (var i = 0; i < myDots.length; i += 1) {
                lg.addLayer(dotlayer[i]);
            };
            lg.addTo(map);
        }
        
        // Call this to clear chart from the layers grouped together on the layer group
        function removeLayers(){
            lg.clearLayers();
        }
    
        //add now the grouped layers to the map
        addLayers()
        

        var cl = L.control.layers(null, {}).addTo(map);
        for (j = 0; j < dotlayer.length; j += 1) {
            var name = "Group " + j + "0-" + j + "9";
            cl.addOverlay(dotlayer[j], name);
        }
        cl.addOverlay(cellLayer, "Cells");
        cl.addOverlay(voronoiLayer, "Voronoi Polygons");
        
        

        // Toggle button to turn layers on and off
        var customControl =  L.Control.extend({
          options: {
            position: 'topright'
          },

          onAdd: function (map) {
            var container = L.DomUtil.create('input');
            container.type="button";
            container.title="Toggle genes on/off";
            container.value = "Hide genes";

            container.style.backgroundColor = 'white';     
            container.style.backgroundSize = "80px 30px";
            container.style.width = '80px';
            container.style.height = '30px';
              

            function toggle(button) {
                if(button.value=="Hide genes") {
                    button.value="Show genes"
                    button.innerHTML="Show genes"
                    removeLayers();
                } else if(button.value=="Show genes") {
                    button.value="Hide genes"
                    button.innerHTML="Hide genes"
                    addLayers();
                }
            }

            container.onmouseover = function(){
              container.style.backgroundColor = 'pink'; 
            }
            container.onmouseout = function(){
              container.style.backgroundColor = 'white'; 
            }

            container.onclick = function(){
                toggle(this);
              console.log('buttonClicked');
            }


            return container;
          }
        });
        //map.addControl(new customControl());
        
        
        // toggle button (again)
        // Toggle button to turn layers on and off
        // you may also want to try this one: http://www.bootstraptoggle.com/
        var switchControl = L.Control.extend({
          options: {
            position: 'topright'
          },

          onAdd: function(map) {
            var container = L.DomUtil.create('div');
            // Use a child input.
            var input = L.DomUtil.create('input');
            input.type = "checkbox";
            input.title = "Some title";
            input.value = "On";
            // Insert the input as child of container.
            container.appendChild(input);


              function toggle(event) {
                if(event.target.checked === false) {
//                    button.value="Show genes"
//                    button.innerHTML="Show genes"
                    removeLayers();
                } else if(event.target.checked === true) {
//                    button.value="Hide genes"
//                    button.innerHTML="Hide genes"
                    addLayers();
                }
            }
              
            jQuery(input).bootstrapSwitch({
                size: 'mini',
                state: true,
                onText: 'Yes',
                offText: 'No',
              // http://bootstrapswitch.site/options.html
              onSwitchChange: function(event) {
                console.log('buttonClicked', event.target.checked);
                  toggle(event);
              }
            });

            return container;
          }
        });
        //map.addControl(new switchControl());
        
        
        // Bootstrap toggle
        var toggleControl = L.Control.extend({
          options: {
            position: 'topright'
          },

          onAdd: function(map) {
              var container = L.DomUtil.create('div');

              // Use a child input.
              var input = L.DomUtil.create('input');
              input.type = "checkbox";
              input.checked = true;
              input.setAttribute('data-style', 'slow');

              
              // Insert the input as child of container.
              container.appendChild(input);
              
              container.onchange = function(event){
                  toggle(event);
                  console.log('buttonClicked', event.target.checked);
              }
            
              function toggle(event) {
                if(event.target.checked === false) {
                    removeLayers();
                } else if(event.target.checked === true) {
                    addLayers();
                }
              }
              
              jQuery(input).bootstrapToggle({
                  //size: 'small',
                  on: 'Genes: On',
                  off: 'Genes: Off',
                  width: 100,
                  height: null,
              });

            return container;
          }
        });
        map.addControl(new toggleControl());
        

        

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
            p = t.transform(L.point([x, y]));
            //p = xy(project([x, y], img, grid))
            map.flyTo([p.y, p.x], 5);
        });

        fly2.addEventListener("change", function (event) {
            event.preventDefault();
            x = +document.getElementById("xValue").value
            y = +document.getElementById("yValue").value
            p = t.transform(L.point([x, y]));
            //p = xy(project([x, y], img, grid))
            map.flyTo([p.y, p.x], 5);
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
