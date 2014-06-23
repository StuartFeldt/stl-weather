


var w = 950;
var h = 500;
var dataset;
var projection = d3.geo.albersUsa()
  .translate([w/2-1200, h/2])
  .scale(15000);
var path = d3.geo.path()
  .projection(projection);
var cur_page = 0;

/* 
 * DATA
 * 
 */

var counties = [
                "CLINTON CO.",
                "FRANKLIN CO.",
                "JEFFERSON CO.",
                "JERSEY CO.",
                "LINCOLN CO.",
                "MADISON CO.",
                "MONROE CO.", 
                "ST. CHARLES CO.",
                "ST. CLAIR CO.",
                "ST. LOUIS CO.",
                "WARREN CO.",
                "WASHINGTON CO."
                ];

var types = {
  "tornado": {"color": "#7B1616", "label": "Tornado"},
  "winter": {"color": "#6CD9FF", "label": "Winter Storm"},
  "hail": {"color": "#FFC56C", "label": "Hail"},
  "thunderstorm": {"color": "#494", "label": "High Winds"},
  "heat": {"color": "#D31F1F", "label": "Excessive Heat"}
};

var story = [
  {"q": false, "p": false, "s": 600, "g": false},
  {"q": "type", "p": "tornado", "s": 600, "g": false},
  {"q": "type", "p": "winter storm", "s": 600, "g": false},
  {"q": "type", "p": "hail", "s": 600, "g": false},
  {"q": "type", "p": "thunderstorm wind", "s": 600, "g": false},
  {"q": "type", "p": "heat", "s": 600, "g": false},
  {"q": false, "p": false, "s": 600, "g": false},
  {"q": false, "p": false, "s": 600, "g": 'c'},
  {"q": false, "p": false, "s": 600, "g": 'cb'}
];


/* 
 * LISTENERS
 * 
 */
$('#county').change(function(){
  var county = $(this).find(":selected").attr("value");
  populate_graph("county", county, 1000);
});

$('#graph-controls .page').click(function(){
  cur_page = $(this).attr("order");
  populate_graph(story[cur_page].q, story[cur_page].p, story[cur_page].s, story[cur_page].g);
});

$('#prev').click(function(){
    cur_page--;
    populate_graph(story[cur_page].q, story[cur_page].p, story[cur_page].s, story[cur_page].g);
});

$('#next').click(function(){
  cur_page++;
  populate_graph(story[cur_page].q, story[cur_page].p, story[cur_page].s, story[cur_page].g);
});

/* 
 * D3 SETUP
 * 
 */

 //Container
var svg = d3.select("#graph-container")
  .append("svg")
  .append("g")
  .attr("width", w)
  .attr("height", h)
  .attr("id", "graph");

// Axis's, axes?
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

// legend
var legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(75, 50)");

var offset = 0;
for(var e in types) {
  var legend_g = legend.append("g")
        .attr("id", "g-"+e)
        .attr("class", "g-type");

  legend_g.append("rect")
    .attr("fill", types[e].color)
    .attr("width", 10)
    .attr("height", 10)
    .attr("y", offset)
    .attr("opacity", 0)
    .transition()
      .duration(1500)
      .attr("opacity", 1);

  legend_g.append("text")
    .attr("y", offset + 8)
    .attr("x", 15)
    .text(types[e].label)
    .attr("opacity", 0)
    .transition()
      .duration(1500)
      .attr("opacity", 1);

    offset += 15;
}


/* 
 * D3 FUNCTIONS
 * 
 */

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
                    return types.tornado.color;
                } else if(d.type == "Winter Storm" || d.type == "Heavy Snow") {
                    return types.winter.color;
                } else if(d.type == "Hail") {
                    return types.hail.color;
                } else if(d.type == "Thunderstorm Wind") {
                    return types.thunderstorm.color;
                } else if(d.type = "Heat" || d.type == "Excessive Heat") {
                  return types.heat.color;
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

function group_by_county(data, speed, max) {
  yaxis.selectAll('*').remove();
  xaxis.selectAll('*').remove();

      var circles = svg.selectAll("circle")
          .data(data, function(d) { console.log(d); return d.id; });

      for(var c = 0; c < counties.length; c++) {
        var n = c < 4 ? c + 1 : c < 8 ? c - 3 : c < 12 ? c - 7 : c - 11;
        var o = c < 4 ? 1 : c < 8 ? 2 : c < 12 ? 3 : 4;

        var group = svg.append("g");


        group.append("text")
          .attr("opacity", 0)
          .attr("x", (w/5)*n)
          .attr("y", ((h/4)*o) - 25)
          .attr("text-anchor", "middle")
          .text(counties[c])
            .transition()
            .duration(speed)
            .attr("opacity", 1);
      }

      circles
      .transition()
              .duration(speed)
              .style("fill-opacity", .65)
              .attr("cx", function(d, i) {
                switch(d.county) {
                  case "CLINTON CO.":
                    return (w/5);
                  case "FRANKLIN CO.":
                    return (w/5)*2;
                  case "JEFFERSON CO.":
                    return (w/5)*3;
                  case "JERSEY CO.":
                    return (w/5)*4;
                  case "LINCOLN CO.":
                    return (w/5)*1;
                  case "MADISON CO.":
                    return (w/5)*2;
                  case "MONROE CO.":
                    return (w/5)*3;
                  case "ST. CHARLES CO.":
                    return (w/5)*4;
                  case "ST. CLAIR CO.":
                    return (w/5)*1;
                  case "ST. LOUIS CO.":
                    return (w/5)*2;
                  case "WARREN CO.":
                    return (w/5)*3;
                  case "WASHINGTON CO.":
                    return (w/5)*4;
                  default:
                    return 0;
                }
              })
              .attr("cy", function(d){
                switch(d.county) {
                  case "CLINTON CO.":
                    return (h/4);
                  case "FRANKLIN CO.":
                    return (h/4);
                  case "JEFFERSON CO.":
                    return (h/4);
                  case "JERSEY CO.":
                    return (h/4);
                  case "LINCOLN CO.":
                    return (h/4)*2;
                  case "MADISON CO.":
                    return (h/4)*2;
                  case "MONROE CO.":
                    return (h/4)*2;
                  case "ST. CHARLES CO.":
                    return (h/4)*2;
                  case "ST. CLAIR CO.":
                    return (h/4)*3;
                  case "ST. LOUIS CO.":
                    return (h/4)*3;
                  case "WARREN CO.":
                    return (h/4)*3;
                  case "WASHINGTON CO.":
                    return (h/4)*3;
                  default:
                    return 0;
                }
              });


    circles.exit().transition()
                  .duration(speed)
                  .attr("cy", h)
                  .style("fill-opacity", 1e-6)
                  .remove();




}

function collide(node) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

function calculate_y_pos_injured(num, max){
  var m = (h - 35)/max;
  return h-(num*m) - 30;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function populate_graph(q, p, s, g) {

      legend.selectAll('.g-type')
        .transition()
        .duration(s)
        .attr("opacity", function(d, i , u){
          if(!q) {
            return 1;
          } else {
            return 0;
          }
        });
        if(q) {
          var selector = p.split(' ');
          legend.select('#g-'+selector[0])
            .transition()
            .duration(s)
            .attr("opacity", 1);
          ;
        }

    $('li').removeClass('active');
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
          if(g == "c") {
            group_by_county(data.data, s, data.max);
          } else if(g == "cb"){
            get_county_boundaries();
          } else {
            update(data.data, s, data.max);
          }
          
        });
}

var pc;
function get_county_boundaries() {
  d3.json("stl_counties.json", function(error, c) {
  if (error) return console.error(error);
  console.log(c);

  svg.selectAll('*').remove();

  pc = svg.selectAll("path")
    .data(c.features)
  .enter().append("path")
    .attr("d", path)
    .attr("fill", "steelblue");
  });
}


populate_graph(false, false, 2500);            
