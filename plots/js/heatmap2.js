function heatmap2(data) {

    var margin = {
        top: 10,
        right: 20,
        bottom: 30,
        left: 70
    };

    var monthlyVars = data.map(function (elem) {return elem.variance;}),
        monthlyYears = data.map(function (elem) {return elem.year;}),
        lowVar = d3.min(data),
        highVar = d3.max(data),
        minDate = new Date(d3.min(monthlyYears), 0),
        maxDate = new Date(d3.max(monthlyYears), 0);

    var max = data.length;

    colors = ["#00B73A", "#19B93E", "#33BC42", "#4CBF46", "#66C14B", "#7FC44F", "#99C753", "#B2C958", "#CCCC5C", "#E5CF60", "#FFD265", "#FFD265", "#FAC05A", "#F6AF50", "#F29E46", "#EE8D3C", "#EA7C32", "#E66A28", "#E2591E", "#DE4814", "#DA370A", "#D62600"];

    var baseTemperature = 10;

    var w = $("#chartDiv").width() - margin.left - margin.right;
    var h = w / 1.5 - margin.bottom - margin.top;

    console.log("here");

    data.forEach(function (d) {
        d.temperature = baseTemperature + d.variance;
    });



    /*  d3.select("#chartDiv").append("svg").attr("width",300).attr("height",300).style("background-color","red");*/
    var xScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d.year;
        }))
        .range([0, w]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return d.month;
        }))
        .range([h - h / 13, 0]);

    var zScale = d3.scaleSequential(d3.interpolateSpectral);

    var colorScale = d3.scaleQuantile().
    domain([lowVar + baseTemperature, highVar + baseTemperature]).
    range(colors);


    zScale.domain(d3.extent(data, function (d) {
        return d.temperature;
    }));

    svg = d3.select("#chartDiv")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .style("background-color", "white")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll("rect").data(data)
        .enter().append("rect")
        .attr("class", "myrect")
        .attr("x", function (d) {
            return xScale(d.year);
        })
        .attr("y", function (d) {
            return yScale(d.month);
        })
        .attr("width", function (d) {
            return w / data.length * 12 + 1;
        })
        .attr("height", Math.round(h / 11.8))
        .style("fill", function (d) {
            return zScale(d.temperature);
        })
        .on("mouseover", function (d) {
            $("#tooltip").html("Year:" + d.year + "<br/>Month:" + d.month + "<br/>Temperature:" + Math.round(d.temperature * 100) / 100 + "<br/>Variance:" + d.variance);

            var xpos = d3.event.pageX + 10;
            var ypos = d3.event.pageY + 20;
            $("#tooltip").css("left", xpos + "px")
                .css("top", ypos + "px")
                .animate()
                .css("opacity", 1);
        })
        .on("mouseout", function () {
            $("#tooltip").animate({
                duration: 500
            }).css("opacity", 0);
        });

    var yAxis = d3.axisLeft().scale(yScale).ticks(12);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + h / 20 + ")")
        .call(yAxis);

    var xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickFormat(d3.format(""));

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h + 5) + ")")
        .call(xAxis);

    var ylabel = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -h / 2).attr("y", -30)
        .text("Month");

};
