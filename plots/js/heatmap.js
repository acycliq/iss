function heatmap(dataset) {
    console.log("I am in heatmap.js")

    var idx = 0;
    var cur = 0;
    var nK = 72;
    var nG = 92;
    var m = 0;
    var n = 0;


    var svg = d3.select("#heat-chart").select("svg")

    var xLabels = d3.map(dataset, function (d) {
            return d.xLabel;
        }).keys(),
        yLabels = d3.map(dataset, function (d) {
            return d.yLabel;
        }).keys();

    var margin = {
        top: 0,
        right: 0,
        bottom: 40,
        left: 45
    };

    var width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var dotSpacing = 0,
        dotWidth = width / (2 * (xLabels.length + 1)),
        dotHeight = height / (2 * yLabels.length);

    var daysRange = d3.extent(dataset, function (d) {
            return d.xKey
        }),
        days = daysRange[1] - daysRange[0];

    var hoursRange = d3.extent(dataset, function (d) {
            return d.yKey
        }),
        hours = hoursRange[1] - hoursRange[0];

    var tRange = d3.extent(dataset, function (d) {
            return d.val
        }),
        tMin = tRange[0],
        tMax = tRange[1];

    var avg = d3.mean(dataset, function (d) {
        return d.val;
    });

    var sd = d3.deviation(dataset, function (d) {
        return d.val;
    });

    var zScore = function (d) {
        return (d - avg) / sd
    };

    var colors = ['#2C7BB6', '#00A6CA', '#00CCBC', '#90EB9D', '#FFFF8C', '#F9D057', '#F29E2E', '#E76818', '#D7191C'];

    // the scale
    var scale = {
        x: d3.scaleLinear()
            .range([-1, width]),
        y: d3.scaleLinear()
            .range([height, 0]),
    };

    var xBand = d3.scaleBand().domain(xLabels).range([0, width]),
        yBand = d3.scaleBand().domain(yLabels).range([height, 0]);

    var axis = {
        x: d3.axisBottom(scale.x).tickFormat((d, e) => xLabels[d]),
        y: d3.axisLeft(scale.y).tickFormat((d, e) => yLabels[d]),
    };

    var colorScale = d3.scaleQuantile()
        .domain([tMin, colors.length - 1, tMax])
        .range(colors);

    var zoom = d3.zoom()
        .scaleExtent([1, 2 * dotHeight])
        .on("zoom", zoomed);

    var tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // SVG canvas
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(zoom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Clip path
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height + dotHeight);


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

    var chartData = {};
    chartData.scale = scale;
    chartData.axis = axis;
    chartData.xBand = xBand;
    chartData.yBand = yBand;
    chartData.colorScale = colorScale;
    chartData.heatDotsGroup = heatDotsGroup;
    chartData.dotWidth = dotWidth;
    chartData.dotHeight = dotHeight;

    svg.datum(chartData);

    //svg.call(renderPlot, dataset)
}

function updateScales(data, scale) {
    scale.x.domain([0, d3.max(data, d => d.xKey)]),
        scale.y.domain([0, d3.max(data, d => d.yKey)])
}

function renderHeatmap(dataset) {

    var svg = d3.select("#heat-chart")
        .select("svg");
    if (svg.select("#clip").empty()) {
        heatmap(dataset);
    }
    chartData = svg.datum();
    //Do the axes
    updateScales(dataset, chartData.scale);
    svg.select('.y.axis').call(chartData.axis.y)
    svg.select('.x.axis')
        .attr("transform", "translate(0," + chartData.scale.y(-0.5) + ")")
        .call(chartData.axis.x)

    // Do the chart
    const update = chartData.heatDotsGroup.selectAll("ellipse")
        .data(dataset);

    update
        .enter()
        .append("ellipse")
        .attr("rx", chartData.dotWidth)
        .attr("ry", chartData.dotHeight)
        .on("mouseover", function (d) {
            $("#tooltip").html("x: " + d.xLabel + "<br/>y: " + d.yLabel + "<br/>Value: " + Math.round(d.val * 100) / 100);
            var xpos = d3.event.pageX + 10;
            var ypos = d3.event.pageY + 20;
            $("#tooltip").css("left", xpos + "px").css("top", ypos + "px").animate().css("opacity", 1);
        }).on("mouseout", function () {
            $("#tooltip").animate({
                duration: 500
            }).css("opacity", 0);
        })
        .merge(update)
        .transition().duration(800)
        .attr("cx", function (d) {
            return chartData.scale.x(d.xKey) - chartData.xBand.bandwidth();
        })
        .attr("cy", function (d) {
            return chartData.scale.y(d.yKey) + chartData.yBand.bandwidth();
        })
        .attr("fill", function (d) {
            return chartData.colorScale(10 * d.val);
        });

    update.exit().remove();
}
