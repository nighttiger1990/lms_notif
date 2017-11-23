var path = require('path');
var notification = require(path.join(__dirname, '/notification.js'));
var notification_m = require(path.join(__dirname, '/notification_mobile.js'))
module.exports = function(app, io) {
    notification(app, io);
    notification_m(app, io);
};