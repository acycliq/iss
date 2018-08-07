function scatterPlot(data) {

    var margin = {
            top: 10,
            left: 50,
            bottom: 30,
            right: 0
        },
        width = 920 - margin.left - margin.right,
        height = 480 - margin.top - margin.bottom;

    // inner chart dimensions, where the dots are plotted
    var plotAreaWidth = width - margin.left - margin.right;
    var plotAreaHeight = height - margin.top - margin.bottom;

    // radius of points in the scatterplot
    var pointRadius = 2;

    var extent = {
        x: d3.extent(data, function (d) {return d.x}),
        y: d3.extent(data, function (d) {return d.y}),
    };

    var scale = {
        x: d3.scaleLinear().range([0, plotAreaWidth]),
        y: d3.scaleLinear().range([plotAreaHeight, 0]),
    };

    var axis = {
        x: d3.axisBottom(scale.x).ticks(xTicks).tickSizeOuter(0),
        y: d3.axisLeft(scale.y).ticks(yTicks).tickSizeOuter(0),
    };
    

    var colorScale = d3.scaleLinear().domain([0, 1]).range(['#06a', '#06a']);

    // select the root container where the chart will be added
    var container = d3.select('#scatter-plot');

    var zoom = d3.zoom()
        .scaleExtent([1, 5])
        .on("zoom", zoomed);

    // initialize main SVG
    var svg = container.select('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(zoom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //Create X axis
    renderXAxis = svg.append("g")
        .attr("class", "x axis")

    //Create Y axis
    var renderYAxis = svg.append("g")
        .attr("class", "y axis")


    // set up axis generating functions
    var xTicks = Math.round(plotAreaWidth / 50);
    var yTicks = Math.round(plotAreaHeight / 50);

    
    function updateScales(data, scale){
        scale.x.domain([extent.x[0] - 100, extent.x[1] + 100]).nice(),
        scale.y.domain([extent.y[0] - 100, extent.y[1] + 100]).nice()
    }

    function zoomed() {
//        d3.event.transform.y = 0;
//        d3.event.transform.x = Math.min(d3.event.transform.x, 5);
//        d3.event.transform.x = Math.max(d3.event.transform.x, (1 - d3.event.transform.k) * width);

        // update: rescale x axis
        renderXAxis.call(axis.x.scale(d3.event.transform.rescaleX(scale.x)));

        // Make sure that only the x axis is zoomed
        heatDotsGroup.attr("transform", d3.event.transform.toString().replace(/scale\((.*?)\)/, "scale($1, 1)"));
    }

    renderPlot(data);
    
    function renderPlot(data){
        updateScales(data, scale);
        
        svg.select('.y.axis')
            .attr("transform", "translate(" + -pointRadius + " 0)" )
            .call(axis.y);
        
        var h = plotAreaHeight + pointRadius;
        svg.select('.x.axis')
            .attr("transform", "translate(0, " + h + ")")
            .call(axis.x);
        
        // add in circles
        var circles = svg.append('g').attr('class', 'circles');
        var binding = circles.selectAll('.data-point').data(data, d => d.id);
        binding.enter().append('circle')
            .classed('data-point', true)
            .attr('r', pointRadius)
            .attr('cx', d => scale.x(d.x))
            .attr('cy', d => scale.y(d.y))
            .attr('fill', d => colorScale(d.y));

        binding.transition().duration(1000)
            .attr("cx", d => scale.x(d.x))
            .attr("cy", d => scale.x(d.y)) // This is meant to be scale.y probably
            .attr("r", 2)
            .style("opacity", 1);
        
        
    }

    // ----------------------------------------------------
    // Add in Voronoi interaction
    // ----------------------------------------------------

    // add in interaction via voronoi
    // create a voronoi diagram based on the data and the scales
    var voronoiDiagram = d3.voronoi()
        .x(d => scale.x(d.x))
        .y(d => scale.y(d.y))
        .size([plotAreaWidth, plotAreaHeight])(data);

    // limit how far away the mouse can be from finding a voronoi site
    var voronoiRadius = plotAreaWidth / 10;


    // add a circle for indicating the highlighted point
    svg.append('circle')
        .attr('class', 'highlight-circle')
        .attr('r', pointRadius + 2) // slightly larger than our points
        .style('fill', 'none')
        .style('display', 'none');

    // callback to highlight a point
    function highlight(d) {
        // no point to highlight - hide the circle and clear the text
        if (!d) {
            d3.select('.highlight-circle').style('display', 'none');

            // otherwise, show the highlight circle at the correct position
        } else {
            d3.select('.highlight-circle')
                .style('display', '')
                .style('stroke', colorScale(d.y))
                .attr('cx', scale.x(d.x))
                .attr('cy', scale.y(d.y));
        }
    }

    // callback for when the mouse moves across the overlay
    function mouseMoveHandler() {
        // get the current mouse position
        var [mx, my] = d3.mouse(this);

        // use the new diagram.find() function to find the voronoi site closest to
        // the mouse, limited by max distance defined by voronoiRadius
        //var site = voronoiDiagram.find(mx, my, voronoiRadius);
        var site = voronoiDiagram.find(mx, my);

        // highlight the point if we found one, otherwise hide the highlight circle
        highlight(site && site.data);


        let sdata = []
        for (let i = 0; i < site.data.Prob.length; i++) {
            sdata.push({
                Prob: site.data.Prob[i],
                labels: site.data.ClassName[i]
            })
        }
        console.log(data.length)
    }

    // add the overlay on top of everything to take the mouse events
    svg.append('rect')
        .attr('class', 'overlay')
        .attr('width', plotAreaWidth)
        .attr('height', plotAreaHeight)
        .style('fill', 'red')
        .style('opacity', 0)
        .on('mousemove', mouseMoveHandler)
        .on('mouseleave', () => {
            // hide the highlight circle when the mouse leaves the chart
            //highlight(null);
        });



}

