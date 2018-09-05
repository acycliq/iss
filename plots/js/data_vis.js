function sortByProb(data) {
    var out = [];
    for (var i = 0; i < data.length; i++) {

        t = d3.zip(data[i].ClassName, data[i].Prob);

        t.sort(function (a, b) {
            return b[1] - a[1];
        });

        var ClassName = t.map(function (d, i) {
            return d[0]
        });
        var Prob = t.map(function (d, i) {
            return d[1]
        });

        out.push({
            ClassName_sortedByProb: ClassName,
            Prob_sorted: Prob,
            
            CellGeneCount: data[i].CellGeneCount,
            Cell_Num : data[i].Cell_Num,
            ClassName: data[i].ClassName,
            Genenames: data[i].Genenames,
            Prob: data[i].Prob,
            X: data[i].X,
            Y: data[i].Y,
            x: data[i].x,
            y: data[i].y, 
        });
    }
    
    return out
};

d3.json('./plots/data/iss.json', function (data) {
    data.forEach(function (d) {
        d.Cell_Num = +d.Cell_Num
        d.y = +d.Y
        d.x = +d.X
        console.log(d.Prob)
    });
    //        console.log("Starting DAPI")
    //        dapi(data);
    //        console.log("Starting Scatter")
    data2 = sortByProb(data);
    mydata = initChart(data);
    //        console.log("Starting heatmap")
    //        heatmap()
    console.log("Done!!")
});

d3.json('./plots/data/geneEfficiencies.json', function (data) {
    data.forEach(function (d) {
        d.Prob = +d.GeneEfficiencies
        d.labels = d.GeneNames
        console.log(d.GeneEfficiencies)
    });
    barchart(data);
    console.log("Done again!")
});
