function heatmap(data) {
    
    var dataset = [];
    var idx = 0;
    var cur = 0;
    var nK = 72;
    var nG = 92;
    var m = 0;
    var n = 0;
    
        for (let i = 0; i < nK; i++) { //360
            for (j = 0; j < nG; j++) {  //75
                m = i+(Math.floor(cur/nG)*nG)
                dataset.push({
                    xKey: i,
                    xLabel: data[m].col,
                    yKey: j,
                    yLabel: data[j].row,
                    val: data[cur].val,     
                })
        cur++ }
        };
    
    
    var svg = d3.select("#heat-chart").select("svg")
    
    var xLabels = [],
        yLabels = [];
    for (i = 0; i < dataset.length; i++) {
        if (i==0){
            xLabels.push(dataset[i].xLabel);
            var j = 0;
            while (dataset[j+1].xLabel == dataset[j].xLabel){
                yLabels.push(dataset[j].yLabel);
                j++;
            }
            yLabels.push(dataset[j].yLabel);
        } else {
            if (dataset[i-1].xLabel == dataset[i].xLabel){
                //do nothing
            } else {
                xLabels.push(dataset[i].xLabel);                    
            }
        }
    };

    var margin = {top: 0, right: 0,
                  bottom: 40, left: 45};  

    var width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var dotSpacing = 0,
        dotWidth = width/(2*(xLabels.length+1)),
        dotHeight = height/(2*yLabels.length);

    var daysRange = d3.extent(dataset, function (d) {return d.xKey}),
        days = daysRange[1] - daysRange[0];
    
    var hoursRange = d3.extent(dataset, function (d) {return d.yKey}),
        hours = hoursRange[1] - hoursRange[0];    
    
    var tRange = d3.extent(dataset, function (d) {return d.val}),
        tMin = tRange[0],
        tMax = tRange[1];

    var colors = ['#2C7BB6', '#00A6CA', '#00CCBC', '#90EB9D', '#FFFF8C', '#F9D057', '#F29E2E', '#E76818', '#D7191C'];

    // the scale
    var scale = {
        x: d3.scaleLinear()
            //.domain([-1, d3.max(dataset, d => d.xKey)])
            .range([-1, width]),
        y: d3.scaleLinear()
            //.domain([0, d3.max(dataset, d => d.yKey)])
            .range([height, 0]),
            //.range([(dotHeight * 2 + dotSpacing) * hours, dotHeight * 2 + dotSpacing]),
    };
    
    var xBand = d3.scaleBand().domain(xLabels).range([0, width]),
        yBand = d3.scaleBand().domain(yLabels).range([height, 0]);
    
    var axis = {
        x: d3.axisBottom(scale.x).tickFormat((d, e) => xLabels[d]),
        y: d3.axisLeft(scale.y).tickFormat((d, e) => yLabels[d]),
    };


    function updateScales(data){
        scale.x.domain([-1, d3.max(data, d => d.xKey)]),
        scale.y.domain([ 0, d3.max(data, d => d.yKey)])
    }

    var colorScale = d3.scaleQuantile()
        .domain([tMin, colors.length - 1, tMax])
        .range(colors);

    var zoom = d3.zoom()
        .scaleExtent([1, 2*dotHeight])
        .on("zoom", zoomed);

    var tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // SVG canvas
    svg = d3.select("#heat-chart").select("svg")
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
        .attr("height", height+dotHeight);


    // Heatmap dots
    var heatDotsGroup = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("g");
        
    

    //Create X axis
    var renderXAxis = svg.append("g")
        .attr("class", "x axis")
        //.attr("transform", "translate(0," + scale.y(-0.5) + ")")
        //.call(axis.x)

    //Create Y axis
    var renderYAxis = svg.append("g")
        .attr("class", "y axis")
        .call(axis.y);


    function zoomed() {
        d3.event.transform.y = 0;
        d3.event.transform.x = Math.min(d3.event.transform.x, 5);
        d3.event.transform.x = Math.max(d3.event.transform.x, (1 - d3.event.transform.k) * width);
        // console.log(d3.event.transform)

        // update: rescale x axis
        renderXAxis.call(axis.x.scale(d3.event.transform.rescaleX(scale.x)));

        // Make sure that only the x axis is zoomed
        heatDotsGroup.attr("transform", d3.event.transform.toString().replace(/scale\((.*?)\)/, "scale($1, 1)"));
    }
    
    svg.call(renderPlot, dataset)
    
    function renderPlot(selection, dataset){
        
        //Do the axes
        updateScales(dataset)
        selection.select('.y.axis').call(axis.y)
        selection.select('.x.axis')
                .attr("transform", "translate(0," + scale.y(-0.5) + ")")
                .call(axis.x)
        
        selection.call(renderPoints, dataset);
    }
    
    
    function renderPoints(selection, dataset){
        
        // Do the chart
        heatDotsGroup.selectAll("ellipse")
        .data(dataset)
        .enter()
        .append("ellipse")
        .attr("cx", function (d) {return scale.x(d.xKey) - xBand.bandwidth();})
        .attr("cy", function (d) {return scale.y(d.yKey) + yBand.bandwidth();})
        .attr("rx", dotWidth)
        .attr("ry", dotHeight)
        .attr("fill", function (d) {
            return colorScale(d.val*35);
        })
        .on("mouseover", function (d) {
            $("#tooltip").html("X: " + d.xLabel + "<br/>Y: " + d.yLabel + "<br/>Value: " + Math.round(d.val * 100) / 100);
            var xpos = d3.event.pageX + 10;
            var ypos = d3.event.pageY + 20;
            $("#tooltip").css("left", xpos + "px").css("top", ypos + "px").animate().css("opacity", 1);
        }).on("mouseout", function () {
            $("#tooltip").animate({
                duration: 500
            }).css("opacity", 0);
        });    
        
    }


};
