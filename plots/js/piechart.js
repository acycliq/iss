function piechart(data)
{
    //var data = [{"letter":"A","presses":2},{"letter":"B","presses":2},{"letter":"C","presses":1}];
    console.log(data);
    
    var pieData = []
    for (var i=0; i < data.length; i++) {
        pieData.push({
            value: Math.floor(data[i].Prob*10000)/100,
            label: data[i].label,
        })
    }
    
    var width = 250,
        height = 250,
        radius = Math.min(width, height) / 2;

    var color = d3.scaleOrdinal(d3.schemeCategory10)
        //.range(["#A07A19", "#AC30C0", "#EB9A72", "#BA86F5", "#EA22A8"]);

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie

    var svg = d3.select("#pie")
        .select("svg")
        .attr("id", "mysvg")
        .attr("width", width)
        .attr("height", height)
//            .append("g")
//            .attr("transform", "translate(" + width/2 + "," + height/2 +")"); // Moving the center point



        pie = new d3pie("#mysvg", {
              size: {
                    canvasHeight: +svg.attr("height"),
                    canvasWidth: +svg.attr("width")
                  },
            data: {
                content: pieData
            },

            //Here further operations/animations can be added like click event, cut out the clicked pie section.
            callbacks: {
                onMouseoverSegment: function (info) {
                    console.log("mouse in", info);
                },
                onMouseoutSegment: function (info) {
                    console.log("mouseout:", info);
                }
            }

        });



}
