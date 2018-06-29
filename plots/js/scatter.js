function initChart(data)
{

// ----------------------------------------------------
// Build a basic scatterplot
// ----------------------------------------------------

// outer svg dimensions
//const width = 600;
//const height = 400;

// padding around the chart where axes will go
const padding =  { top: 10, left: 50, bottom: 30, right: 10 },
width = 960 - padding.left - padding.right,
height = 500 - padding.top - padding.bottom;

// inner chart dimensions, where the dots are plotted
const plotAreaWidth = width - padding.left - padding.right;
const plotAreaHeight = height - padding.top - padding.bottom;

// radius of points in the scatterplot
const pointRadius = 2;

var extent = {
    x: d3.extent(data, function(d) {return d.x}),
    y: d3.extent(data, function(d) {return d.y})
  };

// initialize scales
const xScale = d3.scaleLinear().domain([extent.x[0] - 100, extent.x[1] + 100]).range([0, plotAreaWidth]).nice();
const yScale = d3.scaleLinear().domain([extent.y[0] - 100, extent.y[1] + 100]).range([plotAreaHeight, 0]).nice();
const colorScale = d3.scaleLinear().domain([0, 1]).range(['#06a', '#06a']);

// select the root container where the chart will be added
const container = d3.select('#scatter-plot');

// initialize main SVG
const svg = container.select('svg')
    .attr("width", width + padding.left + padding.right)
    .attr("height", height + padding.top + padding.bottom);

// the main <g> where all the chart content goes inside
const g = svg.append('g')
  .attr('transform', `translate(${padding.left} ${padding.top})`);

// add in axis groups
const xAxisG = g.append('g').classed('x-axis', true)
  .attr('transform', `translate(0 ${plotAreaHeight + pointRadius})`);

// x-axis label
g.append('text')
  .attr('transform', `translate(${plotAreaWidth / 2} ${plotAreaHeight + (padding.bottom)})`)
  .attr('dy', +10) // adjust distance from the bottom edge
  .attr('class', 'axis-label')
  .attr('text-anchor', 'middle')
  .text('X Axis');

const yAxisG = g.append('g').classed('y-axis', true)
  .attr('transform', `translate(${-pointRadius} 0)`);

// y-axis label
g.append('text')
  .attr('transform', `rotate(270) translate(${-plotAreaHeight / 2} ${-padding.left})`)
  .attr('dy', 12) // adjust distance from the left edge
  .attr('class', 'axis-label')
  .attr('text-anchor', 'middle')
  .text('Y Axis');

// set up axis generating functions
const xTicks = Math.round(plotAreaWidth / 50);
const yTicks = Math.round(plotAreaHeight / 50);

const xAxis = d3.axisBottom(xScale)
  .ticks(xTicks)
  .tickSizeOuter(0);

const yAxis = d3.axisLeft(yScale)
  .ticks(yTicks)
  .tickSizeOuter(0);

// draw the axes
yAxisG.call(yAxis);
xAxisG.call(xAxis);


// add in circles
const circles = g.append('g').attr('class', 'circles');
const binding = circles.selectAll('.data-point').data(data, d => d.id);
binding.enter().append('circle')
  .classed('data-point', true)
  .attr('r', pointRadius)
  .attr('cx', d => xScale(d.x))
  .attr('cy', d => yScale(d.y))
  .attr('fill', d => colorScale(d.y));

  binding.transition().duration(1000)
  .attr("cx",  d => xScale(d.x))
  .attr("cy",  d => xScale(d.y))
  .attr("r", 2)
  .style("opacity", 1);


// ----------------------------------------------------
// Add in Voronoi interaction
// ----------------------------------------------------

// add in interaction via voronoi
// initialize text output for highlighted points
const highlightOutput = d3.select('#id_position')
  .attr('class', 'highlight-output')
//  .style('padding-left', `${padding.left}px`)
//  .style('min-height', '100px');

const highlightOutput2 = d3.select('#id_cellgenecount')
  .attr('class', 'highlight-output')
  .style('padding-left', `${10}px`)
  .style('min-height', '100px');

const highlightOutput4 = d3.select('#id_genenames')
  .attr('class', 'highlight-output')
  .style('padding-left', `${10}px`)
  .style('min-height', '100px');

const highlightOutput3 = d3.select('#id_classname')
  .attr('class', 'highlight-output')
  .style('padding-left', `${10}px`)
  .style('min-height', '100px');

const highlightOutput5 = d3.select('#id_prob')
  .attr('class', 'highlight-output')
  .style('padding-left', `${10}px`)
  .style('min-height', '100px');


// create a voronoi diagram based on the data and the scales
const voronoiDiagram = d3.voronoi()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y))
  .size([plotAreaWidth, plotAreaHeight])(data);

// limit how far away the mouse can be from finding a voronoi site
const voronoiRadius = plotAreaWidth / 10;


// add a circle for indicating the highlighted point
g.append('circle')
  .attr('class', 'highlight-circle')
  .attr('r', pointRadius + 2) // slightly larger than our points
  .style('fill', 'none')
  .style('display', 'none');

// callback to highlight a point
function highlight(d) {
  // no point to highlight - hide the circle and clear the text
  if (!d) {
    d3.select('.highlight-circle').style('display', 'none');
    highlightOutput.text('');
    highlightOutput2.text('');

  // otherwise, show the highlight circle at the correct position
  } else {
    d3.select('.highlight-circle')
      .style('display', '')
      .style('stroke', colorScale(d.y))
      .attr('cx', xScale(d.x))
      .attr('cy', yScale(d.y));

    // format the highlighted data point for inspection
    highlightOutput.html("<strong>Cell Num: </strong>" + JSON.stringify(d.Cell_Num) + "<br> <strong>X </strong> = " + d.x  + "<br> <strong>Y </strong> = " + d.y);

    highlightOutput2.html(JSON.stringify(d.CellGeneCount)
      .replace(/]|[[]/g, '')
      .replace(/"(.+?)":/g, '<strong style="width: 40px; display: inline-block">$1:</strong> ')
      .replace(/,/g, '<br>'));
     //document.getElementById('id_1').innerHTML = JSON.stringify("Some text to enterrr")

    highlightOutput4.html(JSON.stringify(d.ClassName)
      .replace(/]|[[]/g, '')
      .replace(/\"/g, "")
      .replace(/"(.+?)":/g, '<strong style="width: 40px; display: inline-block">$1:</strong> ')
      .replace(/,/g, '<br>'));

    highlightOutput3.html(JSON.stringify(d.Genenames)
      .replace(/]|[[]/g, '')
      .replace(/\"/g, "")
      .replace(/"(.+?)":/g, '<strong style="width: 40px; display: inline-block">$1:</strong> ')
      .replace(/,/g, '<br>'));

    highlightOutput5.html(JSON.stringify(d.Prob)
      .replace(/]|[[]/g, '')
      .replace(/"(.+?)":/g, '<strong style="width: 40px; display: inline-block">$1:</strong> ')
      .replace(/,/g, '<br>'));



    barchart(d)
//    svg2width = width + padding.right + padding.left
//    svg2height = height + padding.top + padding.bottom
//
//    // set the ranges
//    var x = d3.scaleBand()
//        .range([0, svg2width])
//        .padding(0.1);
//    var y = d3.scaleLinear()
//        .range([svg2height, 0])
//
//    x.domain(data.map(function(d,i) { return i; }));
//    y.domain([0, d3.max(d, function(d){return d.Prob;})]);
//
//    d3.select('#dc-pie-graph').select('svg').selectAll("*").remove()
//    svg2 = d3.select('#dc-pie-graph').select('svg')
//        .attr("width", width + padding.right + padding.left)
//        .attr("height", height + padding.top + padding.bottom)
//        .append("g")
//       .attr("transform",
//          "translate(" + padding.left + "," + padding.top + ")");;
//
//    var mybars = svg2.selectAll("rect").data(d)
//    var barPadding = 5;
//    var barWidth = (svg2width / d.Prob.length);
//
//    mybars.enter().append("rect")
//    .attr("y", function(d){return y(d.Prob);})
//    .attr("height", function(d) { return height - d.Prob; })
//    .attr("width", barWidth - barPadding)
//
//    mybars.exit().remove()


  }
}

// callback for when the mouse moves across the overlay
function mouseMoveHandler() {
  // get the current mouse position
  const [mx, my] = d3.mouse(this);

  // use the new diagram.find() function to find the voronoi site closest to
  // the mouse, limited by max distance defined by voronoiRadius
  //const site = voronoiDiagram.find(mx, my, voronoiRadius);
  const site = voronoiDiagram.find(mx, my);

  // highlight the point if we found one, otherwise hide the highlight circle
  highlight(site && site.data);
}

// add the overlay on top of everything to take the mouse events
g.append('rect')
  .attr('class', 'overlay')
  .attr('width', plotAreaWidth)
  .attr('height', plotAreaHeight)
  .style('fill', 'red')
  .style('opacity', 0)
  .on('click', mouseMoveHandler)
  .on('mouseleave', () => {
    // hide the highlight circle when the mouse leaves the chart
    //highlight(null);
  });


// ----------------------------------------------------
// Add a fun click handler to reveal the details of what is happening
// ----------------------------------------------------

/**
 * Add/remove a visible voronoi diagram and a circle indicating the radius used
 * in the voronoi find function
 */
function toggleVoronoiDebug() {
  // remove if there
  if (!g.select('.voronoi-polygons').empty()) {
    g.select('.voronoi-polygons').remove();
    g.select('.voronoi-radius-circle').remove();
    g.select('.overlay').on('mousemove.voronoi', null).on('mouseleave.voronoi', null);
  // otherwise, add the polygons in
  } else {
    // add a circle to follow the mouse to draw the voronoi radius
    g.append('circle')
      .attr('class', 'voronoi-radius-circle')
      .attr('r', voronoiRadius)
      .style('fill', 'none')
      .style('stroke', 'tomato')
      .style('stroke-dasharray', '3,2')
      .style('display', 'none');


    // move the voronoi radius mouse circle with the mouse
    g.select('.overlay')
      .on('mousemove.voronoi', function mouseMoveVoronoiHandler() {
        const [mx, my] = d3.mouse(this);
        d3.select('.voronoi-radius-circle')
          .style('display', '')
          .attr('cx', mx)
          .attr('cy', my);
      })
      .on('mouseleave.voronoi', () => {
        d3.select('.voronoi-radius-circle').style('display', 'none');
      });


    // draw the polygons
    const voronoiPolygons = g.append('g')
      .attr('class', 'voronoi-polygons')
      .style('pointer-events', 'none');

    const binding = voronoiPolygons.selectAll('path').data(voronoiDiagram.polygons());
    binding.enter().append('path')
      .style('stroke', 'tomato')
      .style('fill', 'none')
      .style('opacity', 0.15)
      .attr('d', d => `M${d.join('L')}Z`);
  }
}

// turn on and off voronoi debugging with click
//svg.on('click', toggleVoronoiDebug);

function onDoubleClick(){
    d3.select('.highlight-circle').style('display', 'none');
    highlightOutput.text('');
    highlightOutput2.text('');
    highlightOutput3.text('');
    highlightOutput4.text('');
    highlightOutput5.text('');

    svg2.selectAll("*").remove()


}
svg.on('dblclick', onDoubleClick);

}
