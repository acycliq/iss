function scatterPlot(data) {

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

    var colorScale = d3.scaleLinear().domain([0, 1]).range(['#06a', '#06a']);

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
        scale.x.domain([extent.x[0], extent.x[1]]).nice(),
        scale.y.domain([extent.y[0], extent.y[1]]).nice()
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
    renderPlot(data);

    function renderPlot(data){
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
    };

    // create a voronoi diagram 
    var voronoiDiagram = d3.voronoi()
        .x(d => scale.x(d.x))
        .y(d => scale.y(d.y))
        .size([width, height])(data);

    // add a circle for indicating the highlighted point
    dotsGroup.append('circle')
        .attr('class', 'highlight-circle')
        .attr('r', pointRadius*2) // increase the size if highlighted
        .style('fill', 'red')
        .style('display', 'none');

    // add the overlay on top of everything to take the mouse events
    dotsGroup.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'red')
        .style('opacity', 0)
        .on('mousemove', mouseMoveHandler)
        .on('mouseleave', () => {
            // hide the highlight circle when the mouse leaves the chart
            console.log('mouse leave');
            highlight(null);
    });

    var prevHighlightDotNum = null;
    // callback to highlight a point
    function highlight(d) {
        // no point to highlight - hide the circle and the tooltip
        if (!d) {
            d3.select('.highlight-circle').style('display', 'none');
            prevHighlightDotNum = null;
            //tooltip.style("opacity",0);
            // otherwise, show the highlight circle at the correct position
        } else {
            if (prevHighlightDotNum !== d.Cell_Num) {
                d3.select('.highlight-circle')
                  .style('display', '')
                  .style('stroke', colorScale(d.y))
                  .attr('cx', scale.x(d.x))
                  .attr('cy', scale.y(d.y));
                prevHighlightDotNum = d.dotNum;
            }
        }
    }

    // callback for when the mouse moves across the overlay
    function mouseMoveHandler() {
        console.log('mouse move');
        
        // get the current mouse position
        var [mx, my] = d3.mouse(this);

        var site = voronoiDiagram.find(mx, my);

        //console.log('site', site);
        // highlight the point if we found one, otherwise hide the highlight circle
        highlight(site && site.data);


        let sdata = []
        for (let i = 0; i < site.data.Prob.length; i++) {
            console.log("Pushing...")
            sdata.push({
                Prob: site.data.Prob[i],
                labels: site.data.ClassName[i]
            })
            console.log("...Pushing done!")
        }
        console.log(data.length)
    }
    
}

