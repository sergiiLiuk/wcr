var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var serialport = require("serialport");
var SerialPort = serialport;
var User = require('../models/user');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var respString = '';
var stat = '';
var errorMsg = '';
 
// Register
router.get('/register', function (req, res) {
    var userData = User.getUserData();
    res.render('register', {
        row: userData
    });
});

// Register User
router.post('/register', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    // Validation
    req.checkBody('username', 'User Name is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();
    if (errors) {
        console.log('vlidation error');
    } else {
        User.writeJSONData(username, password, function (err, user) {
            if (err) throw err;
        });
        res.redirect('/users/register');
    }
    //req.flash('success_msg', 'You are registered and can now login');
});

// Login
router.get('/login', function (req, res) {
    res.render('login');
});

router.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    // Validation
    req.checkBody('username', 'User Name is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        console.log('error');
    } else {
        var userData = User.getUserData();
        userData.forEach(function (entry) {
            if (entry.username === username && entry.password === password) {
                // res.redirect('/users/irrigation');                
                res.redirect('/users/root');
            } else {
                console.log('no match');
            }
        });
    }
});

router.get('/root', function (req, res) {
    respString = '!WC stat00 NPA ND7 NS19:57 NE11:01 \r\n';
    //respString = '!WC stat02 PRA PS15:15 PE15:22 PP57 SR03 SS15:15 SE15:00 SP74 \r\n';

    if (respString != undefined) {
        var fields = respString.split(/ /);
        stat = fields[1];
    } else {
        stat = undefined;
    }

    switch (stat) {
        case 'stat00':
            // Ready            
            res.render('irrigation', {
                ready: true,
                manual_prog: false,
                manual_station: false,
                status: 'Program Pending',
                nextProgram: fields[2].substring(2),
                nextProgStartDay: parseWeekDay(fields[3].substring(2)),
                nextProgStartTime: fields[4].substring(2),
                nextProgEndTime: fields[5].substring(2)
            });
            break;

        case 'stat01':
            // Automatic program running
            res.render('irrigation', {
                status: 'Not implemented'
            });
            break;

        case 'stat02':
            // Manual program running 
            res.render('irrigation', {
                manual_prog: true,
                manual_station: false,
                ready: false,
                status: 'Program active',
                programCurrRun: fields[2].substring(2),
                currProgStartTime: fields[3].substring(2),
                currProgEndTime: fields[4].substring(2),
                currProgProgress: fields[5].substring(2),
                stationCurrRun: fields[6].substring(2),
                currStationStartTime: fields[7].substring(2),
                currStationEndTime: fields[8].substring(2),
                currStationProg: fields[9].substring(2)
            });
            break;

        case 'stat03':
            // Manual station running
            res.render('irrigation', {
                ready: false,
                manual_prog: false,
                manual_station: true,
                status: 'Single station active',
                stationCurrRun: fields[6].substring(2),
                currStationStartTime: fields[7].substring(2),
                currStationEndTime: fields[8].substring(2),
                currStationProg: fields[9].substring(2)
            });
            break;
        case undefined:
            // Error
            res.render('error', {
                errorMsg: errorMsg
            });
            break;
        default:
    }
    respString = undefined;
});

function parseWeekDay(day) {
    switch (day) {
        case '1': // water control      
            return 'Monday';
            break;
        case '2':
            return 'Tuesday';
            break;
        case '3':
            return 'Wednesday';
            break;
        case '4':
            return 'Thursday';
            break;
        case '5':
            return 'Friday';
            break;
        case '6':
            return 'Saturday';
            break;
        case '7':
            return 'Sunday';
            break;

        default:
    }
}

// Ready page
router.get('/ready', function (req, res) {
    res.render('ready');
});

// Setup
router.get('/setup', function (req, res) {
    res.render('setup');
});

router.post('/setup', function (req, res) {
    var water_contr_1 = req.body.water_contr_1;
    var water_contr_2 = req.body.water_contr_2;
    var water_contr_3 = req.body.water_contr_3;
    var water_contr_4 = req.body.water_contr_4;
    var water_contr_5 = req.body.water_contr_5;
    var water_contr_6 = req.body.water_contr_6;
    var water_contr_7 = req.body.water_contr_7;
    var water_contr_8 = req.body.water_contr_8;
    
    res.render('setup', {
        status: ' has been successfully added!',
        success: water_contr_1
    });
});

// Logout
router.get('/logout', function (req, res) {
    res.render('login');
});

// Irrigation
router.get('/irrigation', function (req, res) {
    res.render('irrigation');
});

/*     
    //----------------------------
    io.sockets.on('connection', function (socket) {
        connections.push(socket);
        console.log('Connected: %s sockets connected', connections.length);
        // Disconnect
        socket.on('disconnect', function (data) {
            connections.splice(connections.indexOf(socket), 1);
            console.log('Disconnected: %s sockets connected', connections.length);
        });

        // Get current status
        socket.on('status', function (data) {
            console.log('req get staus sent');
            serialPort.write("@WEB STAT \r\n");
        });

        // Send request every x seconds
        /* setInterval(function () {
             serialPort.write("@WEB STAT \r\n");
         }, 1000);*/

// Start manual program
/* socket.on('start manual program', function (data) {
            console.log(data);
            serialPort.write("@WEB STRT PRG " + data.program + " \r\n");
        });

        // Start manual station
        socket.on('start manual station', function (data) {
            console.log(data);
            serialPort.write("@WEB STRT ST" + data.station + " TIME" + data.time + " \r\n");
        });

        // Stop irrigation
        socket.on('stop irrigation', function (data) {
            console.log('stop irrigation');
            serialPort.write("@WEB STOP \r\n");
        });

    });*/





module.exports = router;