function initChart(data) {


  var totalWidth = 920,
        totalHeight = 480;

    var margin = {
            top: 10,
            left: 50,
            bottom: 30,
            right: 0
        }

    var width = totalWidth  - margin.left - margin.right,
        height = totalHeight  - margin.top - margin.bottom;

    // inner chart dimensions, where the dots are plotted
//    var width = width - margin.left - margin.right;
//    var height = height - margin.top - margin.bottom;

     var tsn = d3.transition().duration(200);

    // radius of points in the scatterplot
    var pointRadius = 2;

    var extent = {
        x: d3.extent(data, function (d) {return d.x}),
        y: d3.extent(data, function (d) {return d.y}),
    };

    var scale = {
        x: d3.scaleLinear().range([0, width]),
        y: d3.scaleLinear().range([height, 0]),
    };

    var axis = {
        x: d3.axisBottom(scale.x).ticks(xTicks).tickSizeOuter(0),
        y: d3.axisLeft(scale.y).ticks(yTicks).tickSizeOuter(0),
    };
    
    var gridlines = {
        x: d3.axisBottom(scale.x).tickFormat("").tickSize(height),
        y: d3.axisLeft(scale.y).tickFormat("").tickSize(-width),
    }

    var colorScale = d3.scaleLinear().domain([0, 1]).range(['tomato', 'tomato']);

    // select the root container where the chart will be added
    var container = d3.select('#scatter-plot');

    var zoom = d3.zoom()
        .scaleExtent([1, 20])
        .on("zoom", zoomed);

    var tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // initialize main SVG
    var svg = container.select('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(zoom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Clip path
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    //Create X axis
    var renderXAxis = svg.append("g")
        .attr("class", "x axis")

    //Create Y axis
    var renderYAxis = svg.append("g")
        .attr("class", "y axis")

    // set up axis generating functions
    var xTicks = Math.round(width / 50);
    var yTicks = Math.round(height / 50);

    function updateScales(data, scale){
        scale.x.domain([extent.x[0]*0.99, extent.x[1]*1.01]).nice(),
        scale.y.domain([extent.y[0]*0.99, extent.y[1]*1.01]).nice()
    }

    function zoomed() {
        d3.event.transform.x = d3.event.transform.x;
        d3.event.transform.y = d3.event.transform.y;

        // update: rescale x axis
        renderXAxis.call(axis.x.scale(d3.event.transform.rescaleX(scale.x)));
        renderYAxis.call(axis.y.scale(d3.event.transform.rescaleX(scale.y)));

        dotsGroup.attr("transform", d3.event.transform);
    }

    var dotsGroup;
    var voronoiDiagram;
    renderPlot(data);
    
    function renderPlot(data){
        console.log('Doing Scatter plot')
        renderScatter(data);
        
        console.log('Doing DAPI')
        dapi(data);
    }

    function renderScatter(data){
        updateScales(data, scale);
        
        svg.select('.y.axis')
            .attr("transform", "translate(" + -pointRadius + " 0)" )
            .call(axis.y);
        
        var h = height + pointRadius;
        svg.select('.x.axis')
            .attr("transform", "translate(0, " + h + ")")
            .call(axis.x);
        
        svg.append("g")
            .attr("class", "grid")
            .call(gridlines.x);

        svg.append("g")
            .attr("class", "grid")
            .call(gridlines.y);

        dotsGroup = svg.append("g")
                       .attr("clip-path", "url(#clip)")
                       .append("g");
        
        //Do the chart
        var update = dotsGroup.selectAll("circle").data(data)
        
        update
            .enter()
            .append('circle')
            .attr('r', pointRadius)
            .attr('cx', d => scale.x(d.x))
            .attr('cy', d => scale.y(d.y))
            .attr('fill', d => colorScale(d.y))
        
        
        // create a voronoi diagram 
        voronoiDiagram = d3.voronoi()
            .x(d => scale.x(d.x))
            .y(d => scale.y(d.y))
            .size([width, height])(data);

        // add a circle for indicating the highlighted point
        dotsGroup.append('circle')
            .attr('class', 'highlight-circle')
            .attr('r', pointRadius*2) // increase the size if highlighted
            .style('fill', '#FFCE00')
            .style('display', 'none');

        // add the overlay on top of everything to take the mouse events
        dotsGroup.append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .style('fill', '#FFCE00')
            .style('opacity', 0)
            .on('click', mouseClickHandler)
            .on('mousemove', mouseMoveHandler)
            .on('mouseleave', () => {
                // hide the highlight circle when the mouse leaves the chart
                console.log('mouse leave');
                highlight(null);
        });
        
        // Manually dispach a mouse click event. That will kick-off rendering of the other charts on the dashboard.
        d3.select('.overlay').dispatch('click')
    
    }; //end renderPlot


    // callback for when the mouse moves across the overlay
    function mouseMoveHandler() {
        // get the current mouse position
        const [mx, my] = d3.mouse(this);

        // use the new diagram.find() function to find the voronoi site closest to
        // the mouse, limited by max distance defined by voronoiRadius
        //const site = voronoiDiagram.find(mx, my, voronoiRadius);
        const site = voronoiDiagram.find(mx, my);

        // highlight the point if we found one, otherwise hide the highlight circle
        highlight(site && site.data, false);

    }
    

    // callback for when the mouse moves across the overlay
    function mouseClickHandler() {
        // get the current mouse position
        const [mx, my] = d3.mouse(this);

        // use the new diagram.find() function to find the voronoi site closest to
        // the mouse, limited by max distance defined by voronoiRadius
        //const site = voronoiDiagram.find(mx, my, voronoiRadius);
        const site = voronoiDiagram.find(mx, my);

        // highlight the point if we found one, otherwise hide the highlight circle
        highlight(site && site.data, true);

    }


    var prevHighlightDotNum = null;
    // callback to highlight a point
    function highlight(d, flag) {
        // no point to highlight - hide the circle and clear the text
        if (!d) {
            d3.select('.highlight-circle').style('display', 'none');
            prevHighlightDotNum = null;
            tooltip.style("opacity",0);
            // otherwise, show the highlight circle at the correct position
        } else {
            if (prevHighlightDotNum !== d.Cell_Num) {
                d3.select('.highlight-circle')
                  .style('display', '')
                  .style('stroke', colorScale(d.y))
                  .attr('cx', scale.x(d.x))
                  .attr('cy', scale.y(d.y));
                  tooltip.transition()
                    .duration(200)
                tooltip
                    .style("opacity", .9)
                    .html("x: " + Math.round(d.x *100)/100 + "<br/>y: " + Math.round(d.y * 100)/100 + "<br/>Cell Num: " + d.Cell_Num )
                    .style("left", (d3.event.pageX + 35) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
                prevHighlightDotNum = d.Cell_Num;                
            }
            
            if (flag === true) {
                
                // If true do the dataTable 
                renderDataTable(d)

                // Do the heatmap as well
                d3.json("./plots/data/weightedMap/json/wm_" + d.Cell_Num + ".json", function (data) {
                    data.forEach(function(d) {
                        d.xKey = +d.xKey
                        d.yKey = +d.yKey
                        d.val = +d.val});
                    console.log("Heatmap start")
                    renderHeatmap(data)
                    console.log("Heatmap end")
                });
                
                // And the barchart, piechart too!
                let sdata = []
                for (let i = 0; i < d.Prob.length; i++) {
                    sdata.push({
                        Prob: d.Prob[i],
                        labels: d.ClassName[i]
                    })
                }

                barchart(sdata)
                piechart(sdata)
                
                //Thats a temp solution to make the dapi chart responsive. There must be a better way
                document.getElementById("xValue").value = d.X
                document.getElementById("yValue").value = d.Y
                var evtx = new CustomEvent('change');
                document.getElementById('xValue').dispatchEvent(evtx);
                var evty = new CustomEvent('change');
                document.getElementById('yValue').dispatchEvent(evty);

            }
        }
    }
    

}
