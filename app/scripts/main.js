
// Wrapping in nv.addGraph allows for '0 timeout render', stores rendered charts in nv.graphs, and may do more in the future... it's NOT required
var chart;

function redraw() {
  nv.addGraph(function() {  

     chart = nv.models.cumulativeLineChart()
               .x(function(d) { return d[0] })
               .y(function(d) { return d[1]/100 })
               .color(d3.scale.category10().range())
               .useInteractiveGuideline(true);

     chart.xAxis
        .tickFormat(function(d) {
            return d; //d3.time.format('%x')(new Date(d))
          });

    chart.yAxis
        .tickFormat(d3.format(',.1%'));

    d3.select('#chart1 svg')
          .datum(theData)
          .transition()
          .duration(0)
          .call(chart);

    //TODO: Figure out a good way to do this automatically
    nv.utils.windowResize(chart.update);
    //nv.utils.windowResize(function() { d3.select('#chart1 svg').call(chart) });

    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

    return chart;
  });
}

// Get 'our' data set
$.getJSON('data/J-S-2004-2012.json', function(data) {
  var allSports = [];
  var sportData = {};
  var sportInfos = [
        'Angebote',
        'Total Teilnehmer',
        'Total Auszahlungen'
      ];

  $.each(data.rows, function() {
    var self = this;
    var sa = self['Sportart'];
    if (allSports.indexOf(sa)<0) {
      allSports.push(sa);
      sportData[sa] = [];
      $.each(sportInfos, function() {
        sportData[sa].push({ key: this, values: [] });
      });
    }
    $.each(sportInfos, function(i, v) {
      if (typeof self[v] !== 'undefined')
        sportData[sa][i].values.push([self['Jahr'], self[v]]);
    });
  });

  $.each(allSports, function() {
    $('.sport-buttons').append(
      '<a class="btn btn-default"><i></i><span>' + this + '</span></a>'
    ).find('a.btn:last').attr('data-sport', this);
  });

  // Set up drop down
  $('#sport-choose').click(function() { $('.sport-buttons').slideDown(); $(this).hide(); });
  $('#sport-dismiss').click(function() { $('.sport-buttons').slideUp(); $('#sport-choose').show();  });
  $('.sport-buttons .btn').click(function() { $('.sport-buttons').slideUp(); $('#sport-choose').show(); 
    var t = $(this).attr('data-sport');
    theData = sportData[t];
    $('.sport-title').html(t);
    //console.log(data);
    redraw();
  });
});

var theData = null;
