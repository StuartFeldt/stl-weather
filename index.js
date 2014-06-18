
$('#county').change(function(){
  var county = $(this).find(":selected").attr("value");
  populate_graph("county", county, 1000);
});

var w = 950;
var h = 500;
var dataset;

var svg = d3.select("#graph-container")
  .append("svg")
  .append("g")
  .attr("width", w)
  .attr("height", h)
  .attr("id", "graph");

var yaxis = svg.append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(0,0)");

var xaxis = svg.append("g")
  .attr("class", "xaxis")
  .attr("transform", "translate(0,0)");

xaxis.append("line")
    .attr("x1", 0)
    .attr("y1", h)
    .attr("x2", w+100)
    .attr("y2", h)
    .attr("stroke", "#222")
    .attr("stroke-width", "1");

for(var y = 0; y <15; y++) {
  var year = 2000 + y;
  xaxis.append("text")
    .text(year)
    .attr("x", (w/14)*y)
    .attr("y", h + 20);
}

function update(data, speed, max) {      
        yaxis.selectAll('*').remove();
        var yaxis_mks = [];
        for(var i = 0; i<=max; i+=(Math.round(max/10))+1) {
          /* --Ticks for x axis--

          var mrk = yaxis.append("line")
          .attr("y2", h+30)
          .attr("y1", h+30)
          .transition()
          .duration(speed)
          .attr("x1", 15)
          .attr("x2", 20)
          .attr("y2", calculate_y_pos_injured(i, max))
          .attr("y1", calculate_y_pos_injured(i, max))
          .attr("stroke", "#222")
          .attr("stroke-width", "1");*/

        var mrk_txt = yaxis.append("text")
          .attr("y", h)
          .transition()
          .duration(speed)
          .attr("x", 0)
          .attr("y", calculate_y_pos_injured(i, max)+4)
          .text(i);

          yaxis_mks.push({mk_txt: mrk_txt})
        }

        var firstdate= data[0].time;

        var circles = svg.selectAll("circle")
            .data(data, function(d) { return d.id; });

      circles.enter()
            .append("circle")
            .attr("cy", h)
            .attr("r", function(d) {
                return Math.log(d.damage+1)+3;
              })
              .attr("fill", function(d) {
                if(d.type == 'Tornado') {
                    return "#940";
                } else if(d.type == "Winter Storm" || d.type == "Heavy Snow") {
                    return "#049";
                } else if(d.type == "Hail") {
                    return "#88a";
                } else if(d.type == "Thunderstorm Wind") {
                    return "#484";
                } else if(d.type = "Heat" || d.type == "Excessive Heat") {
                  return "#c03";
                }
              })
            .transition()
              .duration(speed)
              .style("fill-opacity", .65)
              .attr("cx", function(d, i) {
                return ((d.time - firstdate) / 475000) + 25;
              })
              .attr("cy", function(d){
                return calculate_y_pos_injured((parseInt(d.injuries) + parseInt(d.deaths)), max);
              })
              ;

           circles
           .tooltip(function(d, i) {
                var r, svg2;
                r = +d3.select(this).attr('r');
                svg2 = d3.select(document.createElement("svg")).attr("height", 50);
                g = svg2.append("g");
                g.append("rect").attr("width", r * 10).attr("height", 10);
                g.append("text").text("10 times the radius of the cirlce").attr("dy", "25");
                return {
                  type: "tooltip",
                  text: "<h3>"+d.mag+" "+d.type+"</h3><p><span class='bottom-tip'>"+d.deaths+" dead</span>|<span class='bottom-tip'>"+d.injuries+" injured</span></p><p>"+d.date+"</p><p>"+d.location+", "+d.county+"</p><p>$"+numberWithCommas(d.damage)+" in damage</p></div>",
                  detection: "shape",
                  gravity: "right",
                  placement: "fixed",
                  position: [((d.time - firstdate) / 475000) + 25, calculate_y_pos_injured((parseInt(d.injuries) + parseInt(d.deaths)), max)],
                  displacement: [r, -68],
                  mousemove: false
                };
              })
           .transition()
              .duration(speed)
              .style("fill-opacity", .65)
              .attr("cx", function(d, i) {
                return ((d.time - firstdate) / 475000) + 25;
              })
              .attr("cy", function(d){
                return calculate_y_pos_injured((parseInt(d.injuries) + parseInt(d.deaths)), max);
              });
              
          circles.exit().transition()
              .duration(speed)
              .attr("cy", h)
              .style("fill-opacity", 1e-6)
              .remove();
  
}

function calculate_y_pos_injured(num, max){
  var m = (h - 35)/max;
  return h-(num*m) - 30;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function populate_graph(q, p, s) {

    $('a').removeClass('active');
    switch(p) {
        case "tornado":
            $('#tornado').addClass('active');
            $('#county').val(false);
            break;
        case "hail":
            $('#hail').addClass('active');
            $('#county').val(false);
            break;
        case "heat":
            $('#heat').addClass('active');
            $('#county').val(false);
            break;
        case "winter storm":
            $('#winter').addClass('active');
            $('#county').val(false);
            break;
        case "thunderstorm wind":
            $('#wind').addClass('active');
            $('#county').val(false);
            break;
        default:
            $('#all').addClass('active');
    }

    var url = "ws/getData.php";
    if(q != false) {
        url += "?q=" + q + "&p=" + p;
    }

    $.getJSON(url, function(data){
        dataset = data;
          update(data.data, s, data.max);
        });
}

populate_graph(false, false, 2500);            
