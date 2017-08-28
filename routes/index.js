var path = require('path');
var notification = require(path.join(__dirname, '/notification.js'));

module.exports = function(app, io) {
    notification(app, io);
};