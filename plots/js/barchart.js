
function barchart(data) {

    var ordinals = data.map(function (d) {
            return d.labels;
        });

    // Standard transition for our visualization
    var t = d3.transition().duration(750);

    var svg = d3.select("#bar-chart").select("svg");

    // just for future use in case I want to have patterns
    // on the bars. Not getting used anywhere for now.
    // To have the pattern rendered you need also to set the
    // fill attribute with 'url('myPattern')
    svg.append("defs").append("pattern")
    .attr('id','myPattern')
    .attr("width", 4)
    .attr("height", 4)
    .attr('patternUnits',"userSpaceOnUse")
    .append('path')
    .attr('fill','yellow')
    .attr('stroke','#335553')
    .attr('stroke-width','1')
    .attr('d','M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2' );

    var margin = {
            top: 20,
            right: 20,
            bottom: 0.3 * svg.attr("height"),
            left: 40
        },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        margin2 = {
            top: 20 + margin.top + height,
            right: 20,
            bottom: 0,
            left: 40
        },
        height2 = height / 5;

    // the scale
    var scale = {
        x: d3.scaleLinear().range([0, width]).nice(),
        x2: d3.scaleLinear().range([0, width]).nice(),
        y: d3.scaleLinear().range([height, 0]).nice(),
        y2: d3.scaleLinear().range([height2, 0]).nice()
    };

    let xBand = d3.scaleBand().domain(d3.range(-1, ordinals.length)).range([0, width])

    var axis = {
        x: d3.axisBottom(scale.x).tickFormat((d, e) => ordinals[d]),
        y: d3.axisLeft(scale.y)
    };

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush", brushed)


    var focus = svg.select('.focus')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    focus.select(".axis").attr("transform", "translate(0," + height +")");

    var context = svg.select('.context')
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


    /* Adjust width / height of clip path */
    d3.select("#my-clip-path").select("rect")
      .attr("width",width)
      .attr("height",height)

    function updateScales(data) {
        scale.x.domain([-1, ordinals.length])
        scale.y.domain([0, d3.max(data, d => d.Prob)])
        scale.x2.domain(scale.x.domain())
        scale.y2.domain([0, d3.max(data, d => d.Prob)])
    }


    svg.call(renderPlot, data)

    function renderPlot(selection, data) {
        updateScales(data);

        selection.select(".context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
            .select('.brush')
            .call(brush)
            .call(brush.move, scale.x.range())

        selection.select(".axis2")
            .attr("transform", "translate(0," + height2 +")");

        selection.select(".focus").select(".axis").transition(t).call(axis.x);
        selection.select(".focus").select(".axis.axis--y").transition(t).call(axis.y);

        selection
            .call(renderPoints, data);
    }


    function renderPoints(selection, data) {

        // ***** For future use. Not getting used for now ****
        var colorRamp = classColors()
        var colorMap = d3.map(colorRamp, function(d) { return d.className; });
        // **************

        function colorPicker(d, i) {
            return d3.schemeCategory20[i]
            // if (d.labels === 'Some Name') {
            //     return "#666666";
            // } else if (d.labels === 'Some other name') {
            //     return "#FF0033";
            // }
        }
        
        var points = selection.select('.focus')
          	.selectAll('.bar').data(data);

        var newPoints = points.enter().append('rect')
            .transition(t)
            .attr('class', 'bar')
            .attr('x', (d, i) => {
                return scale.x(i) - xBand.bandwidth() * 0.9 / 2
            })
            .attr('y', (d, i) => {
                return scale.y(d.Prob)
            })
            .attr('width', xBand.bandwidth() * 0.9)
            .attr('height', d => {
                return height - scale.y(d.Prob)
            })
            .attr('fill', function(d, i) {
                return colorPicker(d, i); // call the color picker to get the fill.
            })
            .attr("clip-path","url(#my-clip-path)");

        points.merge(newPoints)
            .transition(t)
            .attr('x', (d, i) => {
                return scale.x(i) - xBand.bandwidth() * 0.9 / 2
            })
            .attr('y', (d, i) => {
                return scale.y(d.Prob)
            })
            .attr('width', xBand.bandwidth() * 0.9)
            .attr('height', d => {
                return height - scale.y(d.Prob)
            })
            .attr('fill', function(d, i) {
                return colorPicker(d, i); // call the color picker to get the fill.
            })
            

        points.exit()
            .transition(t)
            .remove();


        var sPoints = selection.select('.context').selectAll('.bar').data(data);

        var newsPoints = sPoints.enter().append('rect')
            .attr('class', 'bar')
            .attr('x', (d, i) => {
                return scale.x2(i) - xBand.bandwidth() * 0.9 / 2
            })
            .attr('y', (d, i) => scale.y2(d.Prob))
            .attr('width', xBand.bandwidth() * 0.9)
            .attr('height', d => {
                return height2 - scale.y2(d.Prob)
            })
            .attr('fill', function(d, i) {
                return colorPicker(d, i); // call the color picker to get the fill.
            })

        sPoints.merge(newsPoints)
            .transition().duration(1000)
            .attr('x', (d, i) => {
                return scale.x2(i) - xBand.bandwidth() * 0.9 / 2
            })
            .attr('y', (d, i) => scale.y2(d.Prob))
            .attr('width', xBand.bandwidth() * 0.9)
            .attr('height', d => {
                return height2 - scale.y2(d.Prob)
            })
            .attr('fill', function(d, i) {
                return colorPicker(d, i); // call the color picker to get the fill.
            });

        sPoints.exit()
            .transition().duration(1000)
            .remove();



    }


    function brushed() {
        var s = d3.event.selection || scale.x2.range()
        scale.x.domain(s.map(scale.x2.invert, scale.x2))
        focus.select('.axis').call(axis.x)
        focus.selectAll('.bar')
            .attr('x', (d, i) => {
                return scale.x(i) - xBand.bandwidth() * 0.9 / 2
            })
    }


}