var serialport = require("serialport");
var SerialPort = serialport;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var fs = require('fs');

var serverName = 8000;
var portName = 'COM3';

//init for SerialPort connected to Arduino
const serialPort = new SerialPort(portName, {
    baudrate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\n")
});

serialPort.on("open", function () {
    console.log('open');
    serialPort.on('data', function (data) {
        console.log(data);
    });
});

connections = [];

server.listen(process.env.PORT || serverName);
console.log('Server started on port: ' + serverName);

app.use('/css', express.static("./css"));
app.use('/js', express.static("./js"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect
    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    socket.on('test', function (data) {
        serialPort.write(data.status);
    });

    function intervalFunc(){
        var req_ready = '!WC stat02 PRA PS15:15 PE15:22 PP57 SR03 SS15:15 SE15:00 SP74 \r\n';
        serialPort.write(req_ready);
    }
    //setInterval(intervalFunc, 200);

});