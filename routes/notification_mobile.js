var path = require('path');
var async = require('async');
var notification = require(path.join(__dirname, '../', 'modules/notification.js'));
var notification_m = require(path.join(__dirname, '../', 'modules/notification_mobile.js'));
var requestHandling = require(path.join(__dirname, '../', 'ultilities/requestHandling.js'));

module.exports = function(app, io) {
    app.post('/api/user_mapping/create', function (req, res) {
        console.log('success')
    })
    app.post('/api/user_topic/create', function (req, res) {
        console.log('success')
    })
    app.post('/api/user_group/create', function (req, res) {
        console.log('success')
    })

}