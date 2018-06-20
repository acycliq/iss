function initChart(data)
      {

        var margin = { top: 10, left: 50, bottom: 30, right: 10 },
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

        var scale = {
          x: d3.scaleLinear().range([0, width]).nice(),
          y: d3.scaleLinear().range([height, 0]).nice()
        };

        var access = {
          x: function(d) { return d.x; },
          y: function(d) { return d.y; }
        };

        var value = {
          x: function(d) { return scale.x(access.x(d)); },
          y: function(d) { return scale.y(access.y(d)); }
        };

        var axis = {
          x: d3.axisBottom(scale.x),
          y: d3.axisLeft(scale.y)
        };

        var svg = d3.select(".chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g").attr("class", "x axis");
        svg.append("g").attr("class", "y axis");

        svg.call(renderPlot, data);

        function renderPlot(selection, data) {
          updateScales(data);

          selection.select(".x.axis").call(axis.x)
            .attr("transform", "translate(0," + height + ")");

          selection.select(".y.axis").call(axis.y);

          selection
            .call(renderVoronoi, data)
            .call(renderPoints, data);
        }

        function renderVoronoi(selection, data) {  
          var voronoi = d3.voronoi()
            .x(value.x)
            .y(value.y)
            .extent([[0, 0], [width, height]]);

          var polygons = selection.selectAll(".voronoi")
            .data(voronoi(data));

          polygons.enter().append("path")
            .attr("class", "voronoi")
            .on("mouseenter", function(d, i) {
              var datum = selection.selectAll(".point").data()[i];
              selection.call(renderCrosshair, datum);
            })
            .on("mouseleave", function(d, i) {
              selection.selectAll(".crosshair").remove();
            });

          polygons
            .attr("d", d3.line());

          polygons.exit()
            .remove();
        }

        function renderCrosshair(selection, datum) {
          var lineData = [
            // vertical line
            [[value.x(datum), height],[value.x(datum), 0]],
            // horizontal line
            [[0, value.y(datum)],[width, value.y(datum)]]
          ];

          var crosshairs = selection.selectAll(".crosshair.line").data(lineData);

          crosshairs.enter().append("path")
            .attr("class", "crosshair line");

          crosshairs
            .attr("d", d3.svg.line());

          crosshairs.exit()
            .remove();

          var labelData = [
            {
              x: -6,
              y: value.y(datum) + 4,
              text: Math.round(access.y(datum)),
              orient: "left"
            },
            {
              x: value.x(datum),
              y: height + 16,
              text: Math.round(access.x(datum)),
              orient: "bottom"
            }
          ];

          var labels = selection.selectAll(".crosshair.label").data(labelData);

          labels.enter().append("text")
            .attr("class", "crosshair label");

          labels
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .style("text-anchor", function(d) {
              return d.orient === "left" ? "end" : "middle";
            })
            .text(function(d) { return d.text; });

          labels.exit().remove();
        }

      function renderPoints(selection, data) {
        var points = selection.selectAll(".point").data(data);

        points.enter().append("circle")
          .attr("class", "point")
          .attr("cx", value.x)
          .attr("cy", value.y)
          .attr("r", 0)
          .style("opacity", 0);

        points
          .transition().duration(1000)
            .attr("cx", value.x)
            .attr("cy", value.y)
            .attr("r", 2)
            .style("opacity", 1);

        points.exit()
          .transition().duration(1000)
            .attr("r", 0)
            .style("opacity", 0)
            .remove();
      }

      function updateScales(data) {
        var extent = {
          x: d3.extent(data, access.x),
          y: d3.extent(data, access.y)
        };

        scale.x.domain([extent.x[0] - 5, extent.x[1] + 5]);
        scale.y.domain([extent.y[0] - 5, extent.y[1] + 5]);
      }

    }