//var d.Prob = [23, 13, 21, 14, 37, 15, 18, 34, 30, 25];
//d.labels = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
//var data = {Prob:[23, 13, 21, 14, 37, 15, 18, 34, 30, 25], labels:['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']}
//barchart(data)

//var data = [
//            {"Prob":23, "labels":"one"},
//            {"Prob":13, "labels":"two"},
//            {"Prob":21, "labels":"three"},
//            {"Prob":14, "labels":"four"},
//            {"Prob":37, "labels":"five"},
//            {"Prob":15, "labels":"six"},
//            {"Prob":18, "labels":"seven"},
//            {"Prob":34, "labels":"eight"},
//            {"Prob":30, "labels":"nine"},
//            {"Prob":25, "labels":"ten"}
//           ]
//barchart(data)

function barchart(data)
{

var ordinals = data.map(function(d) { return d.labels; });

var margin = {top: 20, right: 50, bottom: 30, left: 50};

var svg = d3.select("#dc-pie-graph").select("svg");
var margin = {top: 20, right: 20, bottom: 0.3*svg.attr("height"), left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    margin2 = {top: 20+margin.top+height, right: 20, bottom: 30, left: 40},
    height2 = height/5;

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
    //x2: d3.axisBottom(scale.x2),
    y: d3.axisLeft(scale.y),
    //y2: d3.axisLeft(scale.y2)
};

var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on('brush', brushed)


var focus = svg.append('g')
              .attr('class', 'focus')
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

focus.append('g').attr('class', 'axis').attr('transform', `translate(0,${height})`)
focus.append('g').attr('class', 'axis axis--y')

var context = svg.append('g')
                   .attr('class', 'context')
                   .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


context.append('g')
      .attr('class', 'axis2')

context.append('g')
        .attr('class', 'brush')


var defs = focus.append('defs');

// use clipPath
defs.append('clipPath')
    .attr('id', 'my-clip-path')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

function updateScales(data){
    scale.x.domain([-1, ordinals.length])
    scale.y.domain([0, d3.max(data, d => d.Prob)])
    scale.x2.domain(scale.x.domain())
    scale.y2.domain([0, d3.max(data, d => d.Prob)])
}


svg.call(renderPlot, data)

function renderPlot(selection, data)
{
    updateScales(data);

    selection.select(".context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")")
        .append('g')
        .attr('class', 'brush')
        .call(brush)
        .call(brush.move, scale.x.range())

    selection.select(".axis2")
        .attr('transform', `translate(0,${height2})`);

    selection.select(".focus").select('.axis').call(axis.x);
    selection.select(".focus").select('.axis.axis--y').call(axis.y);

    selection
        .call(renderPoints, data);

//    selection.select(".context").select(".brush')
//      .call(brush)
//      .call(brush.move, scale.x.range())
}
//var context = svg.append('g')
//                   .attr('class', 'context')
//                   .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


//context.append('g')
//      .attr('class', 'axis2')
//      .attr('transform', `translate(0,${height2})`)

function renderPoints(selection, data){
    var points = selection.select('.focus').selectAll('.bar').data(data);

    var newPoints = points.enter().append('rect')
         .attr('class', 'bar')
         .attr('x', (d, i) => {return scale.x(i) - xBand.bandwidth()*0.9/2})
         .attr('y', (d, i) => {return scale.y(d.Prob)})
         .attr('width', xBand.bandwidth()*0.9)
         .attr('height', d => {return height - scale.y(d.Prob)});

    points.merge(newPoints)
        .transition().duration(1000)
        .attr('x', (d, i) => {return scale.x(i) - xBand.bandwidth()*0.9/2})
        .attr('y', (d, i) => {return scale.y(d.Prob)})
        .attr('width', xBand.bandwidth()*0.9)
        .attr('height', d => {return height - scale.y(d.Prob)});

    points.exit()
        .transition().duration(1000)
        .remove();


    var sPoints = selection.select('.context').selectAll('.bar').data(data);

    var newsPoints = sPoints.enter().append('rect')
         .attr('class', 'bar')
         .attr('x', (d, i) => {return scale.x2(i) - xBand.bandwidth()*0.9/2})
         .attr('y', (d, i) => scale.y2(d.Prob))
         .attr('width', xBand.bandwidth()*0.9)
         .attr('height', d => {return height2 - scale.y2(d.Prob)});

    sPoints.merge(newsPoints)
        .transition().duration(1000)
        .attr('x', (d, i) => {return scale.x2(i) - xBand.bandwidth()*0.9/2})
        .attr('y', (d, i) => scale.y2(d.Prob))
        .attr('width', xBand.bandwidth()*0.9)
        .attr('height', d => {return height2 - scale.y2(d.Prob)});

    sPoints.exit()
        .transition().duration(1000)
        .remove();



}

//focus.append('g')
//     //.attr('clip-path','url(#my-clip-path)')
//     .selectAll('.bar')
//     .data(data)
//     .enter()
//     .append('rect')
//     .attr('class', 'bar')
//     .attr('x', (d, i) => {
//      return scale.x(i) - xBand.bandwidth()*0.9/2
//     })
//     .attr('y', (d, i) => {
//      return scale.y(d.Prob)
//     })
//     .attr('width', xBand.bandwidth()*0.9)
//     .attr('height', d => {
//      return height - scale.y(d.Prob)
//     })

//focus.append('g')
//      .attr('class', 'axis')
//      .attr('transform', `translate(0,${height})`)
//focus.select('.axis').call(axis.x)

//focus.append('g')
//      .attr('class', 'axis axis--y')
//      .call(axis.y)
//focus.select('.axis.axis--y').call(axis.y)


//context.selectAll('.bar')
//     .data(data)
//     .enter()
//     .append('rect')
//     .attr('class', 'bar')
//     .attr('x', (d, i) => {return scale.x2(i) - xBand.bandwidth()*0.9/2})
//     .attr('y', (d, i) => scale.y2(d.Prob))
//     .attr('width', xBand.bandwidth()*0.9)
//     .attr('height', d => {return height2 - scale.y2(d.Prob)})
//
//context.append('g')
//      .attr('class', 'axis2')
//      .attr('transform', `translate(0,${height2})`)
//      .call(axis.x)
//
//context.append('g')
//      .attr('class', 'brush')
//      .call(brush)
//      .call(brush.move, scale.x.range())

function brushed() {
  var s = d3.event.selection || scale.x2.range()
  scale.x.domain(s.map(scale.x2.invert, scale.x2))
  focus.select('.axis').call(axis.x)
  focus.selectAll('.bar')
       .attr('x', (d, i) => {return scale.x(i) - xBand.bandwidth()*0.9/2})
}


}

function barchart2(data)
    {

//    var data = [
//            {"Prob":23, "labels":"one"},
//            {"Prob":13, "labels":"two"},
//            {"Prob":21, "labels":"three"},
//            {"Prob":14, "labels":"four"},
//            {"Prob":37, "labels":"five"},
//            {"Prob":15, "labels":"six"},
//            {"Prob":18, "labels":"seven"},
//            {"Prob":34, "labels":"eight"},
//            {"Prob":30, "labels":"nine"},
//            {"Prob":25, "labels":"ten"}
//           ]

    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 320 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand().range([0, width]).padding(0.1);
        y = d3.scaleLinear().range([height, 0]);

    d3.select('#dc-pie-graph').select('svg').selectAll("*").remove()

    // Create variable for the SVG
    var svg2 = d3.select("#dc-pie-graph").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.labels; }));
    y.domain([0, d3.max(data, function(d) { return d.Prob; })]);

   // append the rectangles for the bar chart
  svg2.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.labels); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Prob); })
      .attr("height", function(d) { return height - y(d.Prob); });

  // add the x Axis
  svg2.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg2.append("g")
      .call(d3.axisLeft(y));


    }