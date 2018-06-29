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

    var data = [
            {"Prob":23, "labels":"one"},
            {"Prob":13, "labels":"two"},
            {"Prob":21, "labels":"three"},
            {"Prob":14, "labels":"four"},
            {"Prob":37, "labels":"five"},
            {"Prob":15, "labels":"six"},
            {"Prob":18, "labels":"seven"},
            {"Prob":34, "labels":"eight"},
            {"Prob":30, "labels":"nine"},
            {"Prob":25, "labels":"ten"}
           ]

    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 320 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand().range([0, width]).padding(0.1);
        y = d3.scaleLinear().range([height, 0]);

    d3.select('#dc-pie-graph').select('svg').selectAll("*").remove()

    // Create variable for the SVG
    var svg = d3.select("#dc-pie-graph").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.labels; }));
    y.domain([0, d3.max(data, function(d) { return d.Prob; })]);

   // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.labels); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Prob); })
      .attr("height", function(d) { return height - y(d.Prob); });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));
    }