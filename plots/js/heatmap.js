function heatmap(){

var data=[{week:1,hour:0,value:8.1495,timestamp:"16-07-2014"},{week:1,hour:1,value:8.2288,timestamp:"16-07-2014"},{week:1,hour:2,value:8.3106,timestamp:"16-07-2014"},{week:1,hour:3,value:8.3446,timestamp:"16-07-2014"},{week:1,hour:4,value:18.4695,timestamp:"16-07-2014"},{week:1,hour:5,value:66.46975,timestamp:"16-07-2014"},{week:1,hour:6,value:.000249999999141,timestamp:"16-07-2014"},{week:1,hour:7,value:0,timestamp:"16-07-2014"},{week:1,hour:8,value:0,timestamp:"16-07-2014"},{week:1,hour:9,value:0,timestamp:"16-07-2014"},{week:1,hour:10,value:0,timestamp:"16-07-2014"},{week:1,hour:11,value:0,timestamp:"16-07-2014"},{week:1,hour:12,value:0,timestamp:"16-07-2014"},{week:1,hour:13,value:0,timestamp:"16-07-2014"},{week:1,hour:14,value:0,timestamp:"16-07-2014"},{week:1,hour:15,value:0,timestamp:"16-07-2014"},{week:1,hour:16,value:0,timestamp:"16-07-2014"},{week:1,hour:17,value:0,timestamp:"16-07-2014"},{week:1,hour:18,value:0,timestamp:"16-07-2014"},{week:1,hour:19,value:0,timestamp:"16-07-2014"},{week:1,hour:20,value:5.9575,timestamp:"16-07-2014"},{week:1,hour:21,value:7.89933333333,timestamp:"16-07-2014"},{week:1,hour:22,value:7.92066666667,timestamp:"16-07-2014"},{week:1,hour:23,value:8.00775,timestamp:"16-07-2014"},{week:2,hour:0,value:8.0664,timestamp:"23-07-2014"},{week:2,hour:1,value:8.19825,timestamp:"23-07-2014"},{week:2,hour:2,value:8.307,timestamp:"23-07-2014"},{week:2,hour:3,value:8.36125,timestamp:"23-07-2014"},{week:2,hour:4,value:8.42825,timestamp:"23-07-2014"},{week:2,hour:5,value:7.344,timestamp:"23-07-2014"},{week:2,hour:6,value:0,timestamp:"23-07-2014"},{week:2,hour:7,value:.000200000000768,timestamp:"23-07-2014"},{week:2,hour:8,value:.000199999999313,timestamp:"23-07-2014"},{week:2,hour:9,value:0,timestamp:"23-07-2014"},{week:2,hour:10,value:0,timestamp:"23-07-2014"},{week:2,hour:11,value:0,timestamp:"23-07-2014"},{week:2,hour:12,value:0,timestamp:"23-07-2014"},{week:2,hour:13,value:0,timestamp:"23-07-2014"},{week:2,hour:14,value:0,timestamp:"23-07-2014"},{week:2,hour:15,value:0,timestamp:"23-07-2014"},{week:2,hour:16,value:0,timestamp:"23-07-2014"},{week:2,hour:17,value:0,timestamp:"23-07-2014"},{week:2,hour:18,value:0,timestamp:"23-07-2014"},{week:2,hour:19,value:0,timestamp:"23-07-2014"}];

function parseDate(input) {
  var parts = input.split('-');
  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[2], parts[1]-1, parts[0]); // Note: months are 0-based
}

var formatDate = d3.timeFormat("%d-%m-%Y");

for (var i = 0; i < data.length; i++) {
	data[i]["timestamp"] = parseDate(data[i]["timestamp"]);
}

var margin = {top: 20, right: 20, bottom: 30, left: 60};
    var width = 1200 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    var colors = ["#E0F7FA", "#B2EBF2", "#80DEEA", "#4DD0E1", "#26C6DA", "#00BCD4", "#00ACC1", "#0097A7", "#00838F", "#006064"];
    var times = ["12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];
    //var buckets = 10;

    var svg = d3.select(".chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var minDate = data[0].timestamp;
            var maxDate = d3.timeWeek.offset(data[data.length - 1].timestamp, 1);

            var plotArea = svg.append("g")
                    .attr("clip-path", "url(#plotAreaClip)");

            // update: set widht and height of clippath rect
            plotArea.append("clipPath")
                    .attr("id", "plotAreaClip")
                    .append("rect")
                    .attr('width', width)
                    .attr('height', height);
                    //.attr({width: width, height: height});

            var x = d3.scaleTime()
                    .range([0, width])
                    .domain([minDate, maxDate]);

            console.log(x(data[2].timestamp));

            var y = d3.scaleLinear()
                    .range([height, 0])
                    .domain([24, 0]);

            var colorScale = d3.scaleQuantile()
                    .domain([0, colors.length - 1, d3.max(data, function (d) {
                        return d.value;
                    })])
                    .range(colors);

            var xAxis = d3.axisBottom()
                    .scale(x);

            var yAxis = d3.axisLeft()
                    .scale(y)
                    .tickFormat(function (d) {
                        return times[d];
                    });




    svg.call(renderPlot, data)

    function renderPlot(selection, data) {

            svg.selectAll(".cell")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "cell")
                    .attr("x", function (d) { return x(d.timestamp); })
                    .attr("y", function (d) { return y(d.hour); })
                    .attr("width", function (d) { return x(d3.timeWeek.offset(d.timestamp, 1)) - x(d.timestamp); })
                    .attr("height", function (d) { return y(d.hour + 1) - y(d.hour); })
                    .attr("fill", function (d) { return colorScale(d.value); });

            var renderXAxis = svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

            var renderYAxis = svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);
        
        var zoom = d3.zoom()
                    .scaleExtent([1, 2])
                    .translateExtent([[80, 20], [width, height]])
                    .on("zoom", zoomed);

            svg.call(zoom);
        


            function zoomed() {
                // update: rescale x axis
                renderXAxis.call(xAxis.scale(d3.event.transform.rescaleX(x)));

                update();
            }

            function update() {
                // update: cache rescaleX value
                var rescaleX = d3.event.transform.rescaleX(x);
                svg.selectAll(".cell")
                        .attr('clip-path', 'url(#plotAreaClip)')
                        // update: apply rescaleX value
                        .attr("x", function (d) { return rescaleX(d.timestamp); })
                        .attr("y", function (d) { return y(d.hour); })
                        // update: apply rescaleX value
                        .attr("width", function (d) { return rescaleX(d3.timeWeek.offset(d.timestamp, 1)) - rescaleX(d.timestamp); })
                        .attr("height", function (d) { return y(d.hour + 1) - y(d.hour); })
                        .attr("fill", function (d) { return colorScale(d.value); });
            }


    }

    }
