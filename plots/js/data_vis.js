
    d3.json('./data/iss.json', function (data) {
          data.forEach(function(d) {
          d.Cell_Num = +d.Cell_Num
          d.y = +d.Y
          d.x = +d.X
          console.log(d.Prob)
          });
        initChart(data);
        console.log("Done!")
        });
