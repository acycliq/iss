function donut(){

	var width = 350,
		height = 250,
		radius = Math.min(width, height) / 2;

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
		.innerRadius(radius * 0.4);

	var outerArc = d3.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	//svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var key = function(d){ return d.data.label; };
	var colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];

	var donutData = {};
    donutData.radius = radius;
	donutData.pie = pie;
    donutData.arc = arc;
    donutData.outerArc = outerArc;
    donutData.key = key;
    donutData.colors = colors;

    return donutData;

}


function donutchart(dataset) {
    var data = []
    for (var i=0; i < dataset.length; i++) {
        data.push({
            // value: Math.floor(dataset[i].value*10000)/100,
            // label: dataset[i].label,
            value: Math.floor(dataset[i].Prob*10000)/100,
            label: dataset[i].labels,
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
};