var socket = io.connect();

// ---- Water control entry data in Menu ----
for (i = 1; i <= 8; i++) {
      $('#water_control').append($('<option>', {
            name: 'opt' + i,
            value: i,
            text: i
      }));
}

// Listen to water control switch
$("#water_control").change(function () {
      var selected_water_cntr = $('#water_control').find(":selected").val();
      alert('selected water control: ' + selected_water_cntr);

});


//-------------Ready State-------------
// Generates input for manual program
var items = ["A", "B", "C", "D", "E"];
$.each(items, function (i, item) {
      $('#man_prog').append($('<option>', {
            text: item
      }));
});

// Generates input for manual station time entry data (00-99)
var time = [];
var i = 0;
for (i; i <= 99; i++) {
      var j = i;
      if (i < 10) {
            j = '0' + j;
      }
      time[i] = j;
}

// Bind options data to select
$.each(time, function (i, elem) {
      $('#man_stat_time').append($('<option>', {
            value: i,
            text: elem
      }));
});

// Generates input for manual station entry data (01-99)
var station = [];
var s;
for (s = 1; s <= 99; s++) {
      var k = s;
      if (s < 10) {
            k = '0' + s;
      }
      station[s - 1] = k;
}

// Bind options data to select
$.each(station, function (i, elem) {
      $('#man_stat').append($('<option>', {
            value: i,
            text: elem
      }));
});

// Manual Station start button, makes server send START MANUAL STATION command on serial port
$('#start_man_stat').on('click', function () {
      var man_statiom = $('#man_stat').find(":selected").text();
      var time = $('#man_stat_time').find(":selected").text();
      if (time === "0" && man_statiom === "0") {
            alert('no station and time selected!');
      } else if (time === "0") {
            alert('no time selected!');
      } else if (man_statiom === "0") {
            alert('no station selected!');
      } else {
            socket.emit('start manual station', {
                  station: man_statiom,
                  time: time
            });
            alert("Selected station: '" + man_statiom + "', " + "Selected time: '" + time + "'");
      }
});

// Manual Program start button, makes server send START MANUAL PROGRAM command on serial port
$('#start_man_prog').on('click', function () {
      var selected_prog = $('#man_prog').find(":selected").text();
      if (selected_prog === "-") {
            alert('no program selected!');
      } else {
            socket.emit('start manual program', {
                  program: selected_prog
            });
            alert("Selected program: " + selected_prog);
      }
});

// Stop Program
$('#stopIrrigation').on('click', function () {
      socket.emit('stop irrigation');
});


