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
    
    // control that shows state info on hover
    var info = L.control({
        position: 'bottomleft'
    });

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    
    function infoMsg(cellFeatures)
    {
        var str1 = '</div></td></tr><tr class><td><div><b>';
        var str2 = '&nbsp </b></div></td><td><div>';
        var out = '';
        if (cellFeatures){
            for (var i=0; i<cellFeatures.Prob.length; i++){
                out += str1 + cellFeatures.ClassName[i] + str2 + Math.floor(cellFeatures.Prob[i] * 10000)/100 + '%'
            }
        }
        else{
             // do nothing
        };
        
        return out;
        
    };
    
    
    // method that we will use to update the control based on feature properties passed
    info.update = function (cellFeatures) {
        var msg = infoMsg(cellFeatures);
        this._div.innerHTML = '<h4>Cell Info</h4>' + (cellFeatures ?
            '<table style="width:110px;">' + 
            '<tbody><tr style="width:110px; border-bottom:1px solid Black; font-weight: bold"><td><div><b>Class </b></div></td><td><div> Prob'  +  
            msg +
            '<tbody><tr style="width:110px; border-top:1px solid black;"><td><div><b>Marker: </b></div></td><td><div>' + cellFeatures.Cell_Num + 
            '</div></td></tr></tbody></table>' :
            '<b>Hover over a cell</b>'
            
            );
    };

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
                "gene": gene,
                "taxonomy": glyphMap.get(gene).taxonomy,
                "glyphName": glyphMap.get(gene).glyphName,
                "glyphColor": getColor(glyphMap.get(gene).taxonomy),
                "popup": label + " " + i,
                "year": parseInt(data[i].Expt),
                "size": 30,
                "type": 'gene',
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
                "Cell_Num": data[i].Cell_Num,
                "Genenames": data[i].Genenames,
                "CellGeneCount": data[i].CellGeneCount,
                "ClassName": data[i].ClassName,
                "Prob": data[i].Prob,
                "x": x,
                "y": y,
                "cx": data[i].cx,
                "cy": data[i].cy,
                "popup": "Cell " + i,
                "year": parseInt(data[i].Expt),
                "size": 30,
                "type": 'cell',
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
        return y === 'non_neuron'? '#FFFFFF': //hsv: [0 0 1]);
            y === 'pc_or_in'? '#407F59':      //hsv: [.4 .5 .5]);
            y === 'less_active'? '#96B38F':   //hsv: [.3 .2 .7]);
            y === 'pc'? '#00FF00':            //hsv: [1/3 1 1]);
            y === 'pc2'? '#44B300':           //hsv: [.27 1 .7]);
            y === 'in_general'? '#0000FF':    //hsv: [2/3 1 1]);
            y === 'sst'? '#00B3FF':           //hsv: [.55 1 1]);
            y === 'pvalb'? '#5C33FF':         //hsv: [.7 .8 1]);
            y === 'ngf'? '#FF00E6':           //hsv: [.85 1 1]);
            y === 'cnr1'? '#FF0000':          //hsv: [ 1 1 1]);
            y === 'vip'? '#FFC700':           //hsv: [.13 1 1]);
            y === 'cxcl14'? '#995C00':        //hsv: [.1 1 .6]);
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
        padding: 0.5,
    });
    
//    var cellRenderer = L.canvas({
//        padding: 0.5,
//        pane: 'cellPane',
//    });
//    
    var geneRenderer = L.canvas({
        padding: 0.5,
        pane: 'genePane',
    });

//    var panes = {};
    
    function getRenderer(type){
        return type==='gene'? geneRenderer:
            myRenderer;
    }

    //create style, with fillColor picked from color ramp
    function style(feature) {
        return {
            radius: getRadius(feature.properties.size),
            shape: feature.properties.glyphName,
            //fillColor: "none",//getColor(feature.properties.taxonomy),
            color: getColor(feature.properties.taxonomy),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.0,
            renderer: myRenderer,//getRenderer(feature.properties.type),
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

    function clickDot(e){
        //make sure zValue is empty
        document.getElementById("zValue").value = ''
        if (e.sourceTarget.feature.properties.type === 'cell'){

            console.log('You clicked a ' + e.sourceTarget.feature.properties.type)
            var layer = e.target;
            var evtxClick = new CustomEvent('clickMouse');
            var evtyClick = new CustomEvent('clickMouse');
            dotStyleHighlight = highlightStyle(layer.feature);
            layer.setStyle(dotStyleHighlight);
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
            document.getElementById("xxValue").value = layer.feature.properties.cx,
                document.getElementById("yyValue").value = layer.feature.properties.cy,
                document.getElementById('xxValue').dispatchEvent(evtxClick),
                document.getElementById('yyValue').dispatchEvent(evtxClick)

        }
    }

    //attach styles and popups to the marker layer
    function highlightDot(e) {
        var layer = e.target;
        var evtxx = new CustomEvent('moveMouse');
        var evtyy = new CustomEvent('moveMouse');
        dotStyleHighlight = highlightStyle(layer.feature);
        layer.setStyle(dotStyleHighlight);
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
        
        layer.feature.properties.type === "cell"?
            (
                console.log('updating info...'),

                info.update(layer.feature.properties),
                this.openPopup(),
            
                //Thats a temp solution to make the scatter chart responsive. 
                document.getElementById("xxValue").value = layer.feature.properties.cx,
                document.getElementById("yyValue").value = layer.feature.properties.cy,
                document.getElementById('xxValue').dispatchEvent(evtxx),
                document.getElementById('yyValue').dispatchEvent(evtyy)
            ):
            console.log("I am not hovering over a cell");
    }

    function resetDotHighlight(e) {
        var layer = e.target;
        dotStyleDefault = style(layer.feature);
        layer.setStyle(dotStyleDefault);
        
        layer.feature.properties.type === "cell"?
            (   
                console.log('resetting info...'),
                info.update()
            ):
            console.log("I am not hovering over a cell");
    }

    function onEachDot(feature, layer) {
        layer.on({
            mouseover: highlightDot,
            mouseout: resetDotHighlight,
            click: clickDot,
        });
        var genePopup = '<table style="width:110px"><tbody><tr><td><div><b>Marker: </b></div></td><td><div>' + feature.properties.popup +
            '</div></td></tr><tr class><td><div><b>Group: </b></div></td><td><div>' + feature.properties.year + 
            '</div></td></tr><tr class><td><div><b>Name: </b></div></td><td><div>' + feature.properties.gene + 
            '</div></td></tr><tr class><td><div><b>Taxonomy: </b></div></td><td><div>' + feature.properties.taxonomy +
            '</div></td></tr><tr class><td><div><b>Glyph: </b></div></td><td><div>' + feature.properties.glyphName + 
            '</div></td></tr><tr><td><div><b>Color: </b></div></td><td><div>' + '<span style="border:1px black solid; background:' + feature.properties.glyphColor + ';font-weight:bold; font-style:italic;">'+ feature.properties.glyphColor + '</span>'  +
            '</div></td></tr><tr><td><div><b>X: </b></div></td><td><div>' + feature.properties.x +
            '</div></td></tr><tr><td><div><b>Y: </b></div></td><td><div>' + feature.properties.y +
            '</div></td></tr></tbody></table>'

        var cellPopup = donutPopup

        if (feature.properties.type === 'gene'){
            popup = genePopup;
        }
        if (feature.properties.type === 'cell'){
            popup = cellPopup;
        }
        
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
        var genes = d3.map(data, function (d) {return d.Gene;}).keys();
        
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
            maxZoom: maxZoom,
        }).setView([img[1] / 2, img[0] / 2], 5);
        
//        map.createPane('myPane');
//        map.createPane('cellPane');
        map.createPane('genePane');

        var urlStr = "./plots/data/img/65536px/{z}/{x}/{y}.png"
        
        L.tileLayer(urlStr, {
            attribution: 'KDH',
            continuousWorld: false,
            minZoom: minZoom,
            noWrap: true
        }).addTo(map);
        
        //Minimap plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls
        tl = L.tileLayer(urlStr, {
            minZoom: minZoom,
            maxZoom: maxZoom
        });
        var miniMap = new L.Control.MiniMap(tl, { toggleDisplay: true }).addTo(map);
        
        //Add fullscreen button
        map.addControl(new L.Control.Fullscreen());


        // Voronoi
        var cellDots = makeCellFeatures(cellData);
        var cellFeatures = cellDots.features;
        var fc = turf.featureCollection(cellFeatures)
        var voronoiPolygons = turf.voronoi(fc, {bbox: [0, 0, img[0], img[1]]});

        //push the features of the cells to polygons
        for (i=0; i < cellFeatures.length; ++i){
            voronoiPolygons.features[i].properties = fc.features[i].properties;
            voronoiPolygons.features[i].properties.generator = fc.features[i].geometry.coordinates;
        }

        // specify popup options
        var customOptions =
            {
               'className' : 'popupCustom'
            }

        var voronoiLayer = L.geoJSON(voronoiPolygons, {style: function(feature) {
            return {
                weight: 0.0, // Voronoi not visible, useful only for navigation purposes
                color: 'tomato',
                opacity: 0.5,
                fill: false,
                dashArray: "4 1",
                renderer: myRenderer,
                //renderer: geneRenderer // place voronois on the same pane as the genes, otherwise they will not respond to mouse events.
            };
        },
            onEachFeature: function(feature, layer) {
            layer.on(
                {
                    'mousemove': function(e){e.target.setStyle({weight:3.0, color: 'red'})},
                    'mouseout': function(e){voronoiLayer.resetStyle(e.target); this.closePopup()},
                    'mouseover': function(e){
                        console.log('Voronoi clicked')
                        //map.fitBounds(e.target.getBounds());
                        console.log("opening popup")
                        var voronoiGenerator = e.target.feature.properties.generator;
                        var targetPoint = L.latLng([voronoiGenerator[1], voronoiGenerator[0]])
                        this.openPopup(targetPoint);
                        },
                    'add': function(e){console.log('add pressed')},
                    'remove': function(e){console.log('remove pressed')},
                }
            );//close layer
                layer.bindPopup(donutPopup, customOptions);
            }

        }).addTo(map);
        
        // Plot the cells. (If these are on different pane than the genes' pane, then they
        // not respond to mouse event. Panes sit on canvas, and afaik the topmost canvas swallows all
        //events and nothing propagates down to panes/layers underneath)
        var cellLayer = L.geoJSON(fc, {
            pointToLayer: function (feature, latlng){
                console.log("hello")
                return L.circleMarker(latlng, style(feature, 'cell'));
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

                    return new svgGlyph(latlng, style(feature, 'gene'));
                },
                onEachFeature: onEachDot
            });
        }

        
        // Keep these layers on a single layer group and call this to add them to the map
        var lg = new L.LayerGroup();
        function addLayers(){
            $('#pleasewait').show();
            setTimeout(function(){
                $('#pleasewait').hide();
                
                for (var i = 0; i < myDots.length; i += 1) {
                    lg.addLayer(dotlayer[i]);
                };
                lg.addTo(map);
                
            }, 500);
        }
        
        
        //Now add info to map
		info.addTo(map);
        
        // Call this to clear chart from the layers grouped together on the layer group
        function removeLayers(){
            $('#pleasewait').show();
            setTimeout(function(){
                $('#pleasewait').hide();
                lg.clearLayers();
            }, 500);
//            $('#pleasewait').hide();
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
              container.setAttribute('rel', 'tooltip');
              container.setAttribute('data-placement', 'bottom');
              container.title = "Show genes?";
              //container.style = "width: 100px";
              
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
        map.addControl(new switchControl());
        
        
        // // Bootstrap toggle
        // var toggleControl = L.Control.extend({
        //   options: {
        //     position: 'topright'
        //   },
        //
        //   onAdd: function(map) {
        //       var container = L.DomUtil.create('div');
        //       var gp = document.getElementsByClassName('leaflet-gene-pane')
        //
        //       // Use a child input.
        //       var input = L.DomUtil.create('input');
        //       input.type = "checkbox";
        //       input.checked = true;
        //       input.setAttribute('data-style', 'slow');
        //
        //
        //       // Insert the input as child of container.
        //       container.appendChild(input);
        //
        //       container.onchange = function(event){
        //           toggle(event);
        //           console.log('buttonClicked', event.target.checked);
        //       }
        //
        //       function toggle(event) {
        //         if(event.target.checked === false) {
        //             //removeLayers();
        //             gp[0].style.display = 'none';
        //         } else if(event.target.checked === true) {
        //             //addLayers();
        //             gp[0].style.display = ''
        //         }
        //       }
        //
        //       jQuery(input).bootstrapToggle({
        //           //size: 'small',
        //           on: 'Genes: On',
        //           off: 'Genes: Off',
        //           width: 100,
        //           height: null,
        //       });
        //
        //     return container;
        //   }
        // });
        // map.addControl(new toggleControl());
        //
        
        // make placeholder for the spinner gif
        function addControlPlaceholders(map) {
            var corners = map._controlCorners,
                l = 'leaflet-',
                container = map._controlContainer;

            function createCorner(vSide, hSide) {
                var className = l + vSide + ' ' + l + hSide;
                corners[vSide + hSide] = L.DomUtil.create('div', className, container);
            }

            createCorner('verticalcenter', 'left');
            createCorner('verticalcenter', 'right');
            createCorner('verticalcenter', 'horizontalcenter');

        }
        addControlPlaceholders(map);


        // Do the spinner control
        var spinnerControl = L.Control.extend({
           options:{position:'verticalcenterhorizontalcenter'},
            
            onAdd: function(map){
                
                var container = L.DomUtil.create('div');
                container.id = "pleasewait";
                container.style = "display: none";
                
                var img = L.DomUtil.create('img');
                img.src="./plots/data/img/spinner.gif";
                
                container.appendChild(img);
                
                return container;
            }
        });
        map.addControl(new spinnerControl());


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
            z = +document.getElementById("zValue").value
            p = t.transform(L.point([x, y]));
            //p = xy(project([x, y], img, grid))

            if (z){
                map.flyTo([p.y, p.x], 5);
            }
        });

        fly2.addEventListener("change", function (event) {
            event.preventDefault();
            x = +document.getElementById("xValue").value
            y = +document.getElementById("yValue").value
            z = +document.getElementById("zValue").value
            p = t.transform(L.point([x, y]));
            //p = xy(project([x, y], img, grid))
            if (z){
                map.flyTo([p.y, p.x], 5);
            }
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
