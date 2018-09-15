function donut(){

	var width = 450,
		height = 300,
		radius = Math.min(width, height) / 2;

	var cornerRadius = 3, // sets how rounded the corners are on each slice
        padAngle = 0.015; // effectively dictates the gap between slices

	var svg = d3.select("#pie")
		.select("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); // Moving the center point

	svg.append("g")
		.attr("class", "slices");
	svg.append("g")
		.attr("class", "labels");
	svg.append("g")
		.attr("class", "lines");

	var pie = d3.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});

	var arc = d3.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.4)
		.cornerRadius(cornerRadius)
        .padAngle(padAngle);

	var outerArc = d3.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	//svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var key = function(d){ return d.data.label; };
	// var colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];
    var colors = d3.schemeCategory20;

    var div = d3.select("body").append("div").attr("class", "toolTip");

	var donutData = {};
    donutData.radius = radius;
	donutData.pie = pie;
    donutData.arc = arc;
    donutData.outerArc = outerArc;
    donutData.key = key;
    donutData.colors = colors;
    donutData.div = div;
    donutData.svg = svg;


    return donutData;

}


function donutchart(dataset) {
    var percentFormat = d3.format(',.2%');

    var data = []
    for (var i=0; i < dataset.length; i++) {
        data.push({
            value: Math.floor(dataset[i].value*10000)/100,
            label: dataset[i].label,
//             value: Math.floor(dataset[i].Prob*10000)/100,
//             label: dataset[i].labels,
        })
    }
    var svg = d3.select("#pie").select("svg")
    if (svg.select('.slices').empty()) {
    	donutData = donut();
    }

    var labels = d3.map(data, function (d) {return d.label;}).keys();
    
    var color = d3.scaleOrdinal()
	.domain(labels)
	.range(donutData.colors);
  
	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
		.data(donutData.pie(data), donutData.key);

	slice.enter()
		.insert("path")
		.style("fill", function(d) { return color(d.data.label); })
		.attr("class", "slice")
		.on("mousemove", mousemoveHandler)
        .on("mouseout", function (d) {
            donutData.div.style("display", "none");
        })
    .merge(slice)
		.transition().duration(1000)
		.attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return donutData.arc(interpolate(t));
			};
		});

    slice.exit()
        .remove();

	function mousemoveHandler() {
            donutData.div.style("left", d3.event.pageX + 10 + "px");
            donutData.div.style("top", d3.event.pageY - 25 + "px");
            donutData.div.style("display", "inline-block");
            donutData.div.html((this.__data__.data.label) + "<br>" + (this.__data__.data.value) + "%");

    }




	/* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
		.data(donutData.pie(data), donutData.key);
		
	function midAngle(d){
		return d.startAngle + (d.endAngle - d.startAngle)/2;
	}

	text.enter()
		.append("text")
		.attr("dy", ".35em")
		.text(function(d) {
			return d.data.label;
		})
	  .merge(text)
	  .transition().duration(1000)
		.attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = donutData.outerArc.centroid(d2);
				pos[0] = donutData.radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
		});

	text.exit()
		.remove();

	/* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg.select(".lines").selectAll("polyline")
		.data(donutData.pie(data), donutData.key);
	
	polyline.enter()
		.append("polyline")
		.merge(polyline)
    .transition().duration(1000)
		.attrTween("points", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = donutData.outerArc.centroid(d2);
				pos[0] = donutData.radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [donutData.arc.centroid(d2), donutData.outerArc.centroid(d2), pos];
			};			
		});
	
	polyline.exit()
		.remove();
    
    
    // Toolip
    
    // function that creates and adds the tool tip to a selected element
    function tooltip(selection) {

        // add tooltip (svg circle element) when mouse enters label or slice
        selection.on('mouseenter', function (d) {

            donutData.svg.append('text')
                .attr('class', 'toolCircle')
                .attr('dy', -5) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                .html(toolTipHTML(d)) // add text to the circle.
                .style('font-size', '.7em')
                .style('text-anchor', 'middle'); // centres text in tooltip

            donutData.svg.append('circle')
                .attr('class', 'toolCircle')
                .attr('r', donutData.radius * 0.38) // radius of tooltip circle
                .style('fill', color(d.data.label)) // colour based on category mouse is over
                .style('fill-opacity', 0.35);

        });

        function toolTipHTML(d) {

            var tip = '',
                i   = 0;

            for (var key in d.data) {

                // if value is a number, format it as a percentage
                var value = (!isNaN(parseFloat(d.data[key]))) ? percentFormat(d.data[key]) : d.data[key];

                // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
                // tspan effectively imitates a line break.
                if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
                else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
                i++;
            }

            return tip;
        }

        // color(d.data.label)
        // remove the tooltip when mouse leaves the slice/label
        selection.on('mouseout', function () {
            d3.selectAll('.toolCircle').remove();
            donutData.div.style("display", "none");
        });
    }

    d3.selectAll('path.slice').call(tooltip);
    
};