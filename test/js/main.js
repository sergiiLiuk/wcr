var socket = io.connect();

$(document).ready(function () {
  // Ready Status test
  $('#test1').click(function () {
    var req_ready = '!WC stat00 NPA ND7 NS19:57 NE11:00 \r\n';
    socket.emit('test', {
      status: req_ready
    });
  }); 

  // Automatic Program running
  $('#test2').click(function () {
    var req_ready = '!WC stat01 PRA PS15:15 PE15:25 PP57 SR03 SS15:15 SE15:00 SP75 \r\n';
    socket.emit('test', {
      status: req_ready
    });
  });

  // Manual Program running
  $('#test3').click(function () {
    var req_ready = '!WC stat02 PRA PS15:15 PE15:22 PP57 SR03 SS15:15 SE15:00 SP22 \r\n';
    socket.emit('test', {
      status: req_ready
    });
  });

  // Manual Station running
  $('#test4').click(function () {
    var req_ready = '!WC stat03 PRA PS15:15 PE15:22 PP57 SR03 SS15:15 SE15:00 SP74 \r\n';
    socket.emit('test', {
      status: req_ready
    });
  });

   

});