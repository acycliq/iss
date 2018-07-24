
    d3.json('./data/iss.json', function (data) {
          data.forEach(function(d) {
          d.Cell_Num = +d.Cell_Num
          d.y = +d.Y
          d.x = +d.X
          console.log(d.Prob)
          });
        console.log("Starting DAPI")
        dapi(data);
        console.log("Starting Scatter")
        mydata = initChart(data);
        console.log("Starting dt")
        //dt(mydata)
        console.log("Done!!")
        });

      d3.json('./data/geneEfficiencies.json', function (data) {
          data.forEach(function(d) {
          d.Prob = +d.GeneEfficiencies
          d.labels = d.GeneNames
          console.log(d.GeneEfficiencies)
          });
        barchart(data);
        console.log("Done again!")
        });