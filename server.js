    var express = require('express');
    var session = require('express-session');
    var app = express();
    var server = require('http').Server(app);
    var router = express.Router();
    var path = require('path');
    var bodyParser = require('body-parser');
    var exphbs = require('express-handlebars');
    var expressValidator = require('express-validator');
    var flash = require('connect-flash');

    var io = require('socket.io').listen(server);

    var serialport = require("serialport");
    var SerialPort = serialport;

    var User = require('../wcr/models/user');

    var serverName = 8080;
    var portName = 'COM4';
    //var portName = "/dev/ttyUSB0";

    var connections = [];
    var connectionsLimit = 8;

    var respString = '';
    var stat = '';
    var loginMsg = "";

    server.listen(process.env.PORT || serverName);
    console.log('Server started on port: ' + serverName);

    server.on('error', function (e) {
        console.log(e);
    });

    // Init for SerialPort connected to Raspbery PI
    var serialPort = new SerialPort(portName, {
        baudrate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false,
        parser: serialport.parsers.readline("\n")
    }, function (err) {
        if (err) {
            return console.log('Error: ', err.message);
        }
    });

    // Read serial port data
    serialPort.on('data', function (data) {
        console.log(data);
        respString = data;
    });

    // View engine
    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', exphbs({
        defaultLayout: 'layout'
    }));

    app.set('view engine', 'handlebars');
    app.use(expressValidator());

    // BodyParser Middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    // Set static folder
    app.use(express.static(path.join(__dirname, 'public')));

    // Routing
    app.use('/public/css', express.static("./public/css"));
    // app.use('/public/css/bootstrap', express.static("./public/css/bootstrap"));
    app.use('/public/img', express.static("./public/img"));
    app.use('/public/js', express.static("./public/js"));

    // Register the session with it*s secret ID
    app.use(session({
        secret: "secret"
    }));

    // Main route
    app.get('/', function (req, res) {
        if (req.session.username) {
            res.redirect('/irrigation');
        } else {
            if (connections.length == connectionsLimit) {
                res.render('userlimitError');
            } else {
                res.redirect('login');
            }
        }
    });

    // Login page
    app.get('/login', function (req, res) {
        if (connections.length == connectionsLimit) {
            res.render('userlimitError');
        } else {
            res.render('login', {
                loginMsg: loginMsg
            });
        }
    });

    app.post('/login', function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var isMatch = false;
        var userData = User.getUserData();
        userData.forEach(function (entry) {
            if (entry.username === username && entry.password === password) {
                req.session.username = req.body.username;
                req.session.password = req.body.password;
                res.redirect('/irrigation');
                loginMsg = "";
                isMatch = true;
            }
        });

        if (isMatch != true) {
            loginMsg = "Wrong Username or Password";
            res.redirect('/login');
        }

    });

    // Irrigation page
    app.get('/irrigation', function (req, res) {
        if (req.session.username) {
            // respString = '!WC stat00 NPA ND7 NS19:57 NE11:01 \r\n';
            // respString = '!WC stat02 PRA PS15:15 PE15:22 PP57 SR03 SS15:15 SE15:00 SP74 \r\n';
            console.log("resp str: " + respString);
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
                        errorMsg: 'Check Serial Port connection and restart Server..'
                    });
                    break;
                default:
            }
            respString = undefined;
        } else {
            res.redirect('/');
        }
    });

    // Parse week day
    function parseWeekDay(day) {
        switch (day) {
            case '1':
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
    app.get('/ready', function (req, res) {
        if (req.session.username) {
            res.render('ready');
        } else {
            res.redirect('/');
        }
    });

    // Setup page
    app.get('/setup', function (req, res) {
        if (req.session.username) {
            res.render('setup');
        } else {
            res.redirect('/');
        }
    });

    app.post('/setup', function (req, res) {
        var water_contr_1 = req.body.water_contr_1;
        var water_contr_2 = req.body.water_contr_2;
        var water_contr_3 = req.body.water_contr_3;
        var water_contr_4 = req.body.water_contr_4;
        var water_contr_5 = req.body.water_contr_5;
        var water_contr_6 = req.body.water_contr_6;
        var water_contr_7 = req.body.water_contr_7;
        var water_contr_8 = req.body.water_contr_8;

        res.render('setup', {
            status: 'has been successfully added!',
            success: water_contr_1
        });
    });

    // Logout page
    app.get('/logout', function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                res.negotiate(err);
            }
            res.redirect('/');
        });
    });

    // Irrigation page
    app.get('/irrigation', function (req, res) {
        if (req.session.username) {
            res.render('irrigation');
        } else {
            res.redirect('/');
        }
    });

    // Register page
    app.get('/register', function (req, res) {
        if (req.session.username) {
            var userData = User.getUserData();
            res.render('register', {
                row: userData
            });
        } else {
            res.redirect('/');
        }
    });

    // Register new user
    app.post('/register', function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        // Validation
        req.checkBody('username', 'User Name is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            console.log('validation error');
        } else {
            User.writeJSONData(username, password, function (err, user) {
                if (err) throw err;
            });
            res.redirect('/register');
        }
    });

    //-------------------Sockets---------------------
    io.sockets.on('connection', function (socket) {
        if (connections.length < connectionsLimit) {
            connections.push(socket);
            console.log('Connected: %s sockets connected', connections.length);
            // Disconnect
            socket.on('disconnect', function (data) {
                connections.splice(connections.indexOf(socket), 1);
                console.log('Disconnected: %s sockets connected', connections.length);
            });

            // Get current status
            socket.on('status', function (data) {
                //console.log('req get staus sent');
                serialPort.write("@WEB STAT \r\n");
            });

            //  serialPort.write("@WEB STAT \r\n");

            // Send request every x seconds
            setInterval(function () {
               // console.log("status req sent");
                serialPort.write("@WEB STAT \r\n");
            }, 200);

            // Start manual program
            socket.on('start manual program', function (data) {
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
        }
    });

    module.exports = router;