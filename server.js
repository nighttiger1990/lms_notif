// set up server
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require(path.join(__dirname, '/config.json'));
var port = config.port;

var notification = require(path.join(__dirname, 'modules/notification.js'));

//set up redis
// var redis = require("redis"),
//     redisClient = redis.createClient({
//         "host": "localhost",
//         "port": "6379"
//     });

// redisClient.on("error", function(err) {
//     console.log("Error " + err);
// });

//control access
var apiwhitelist = config.apiwhitelist;
app.use(require('cors')({
    origin: function(origin, callback) {
        var originIsWhitelisted = apiwhitelist.indexOf(origin)  !== -1;
        // if (originIsWhitelisted)
        callback(null, originIsWhitelisted);
        // else return;
    }
}));
var socketwhitelist = config.socketwhitelist;
if (socketwhitelist.length > 0) {
    var socketWhiteListString = '';
    for (var wi = 0; wi < socketwhitelist.length; wi++)
        socketWhiteListString += socketwhitelist[wi] + ':* ';
    io.set('origins', socketWhiteListString);
}

//serve socket.io.js
app.get('/js/socket.io.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js'));
});

//set up body parser used for reading post request json object
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '300mb' }));
app.use(bodyParser.urlencoded({
    extended: true
}));

//set up morgan
var morgan = require('morgan');
app.use(morgan('dev'));

//socket
io.on('connection', function(socket) {
    socket.on('disconnect', function() {

    });
    socket.on('authentication', function(data) {
        socket.join(data.received_user + '_' + data.received_system);
        notification.count({
            received_user: data.received_user,
            received_system: data.received_system,
            notification_viewed: false
        }, function(error, result) {
            if (!error) {
                io.to(data.received_user + '_' + data.received_system).emit('countNotification', result);
            }
        });
    });
});

//set up routing
var routes = require(path.join(__dirname, '/routes'));
routes(app, io);

app.get('/', function(req, res) {
    res.send('Hello world! it is notification server');
});

//server start
http.listen(port, function() {
    console.log('listening on *:' + port);
});