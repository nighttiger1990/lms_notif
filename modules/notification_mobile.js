var path = require('path');
var async = require('async');
var mongodb = require(path.join(__dirname, '/mongodb.js'));
var firebaseClient = require(path.join(__dirname, '../', 'ultilities/firebaseClient'));
var exports = module.exports = {};

exports.add_user = function (data, callback) {
    var db = mongodb.init();
    db.create(data.received_system + '_user_mapping').find(data, function(error, result) {
        db.close();
        if (error) return callback(JSON.stringify(error), null);
        else if (!result) return callback(null, 0);
        else {
            return callback(null, result.length);
        }
    });
}
exports.add_group = function (data, callback){
    //let db = mongodb.init();
}
exports.add_topic = function (data, callback){
    //let db = mongodb.init();
}
exports.get_users = function(data, callback){
    //Do something
}
exports.get_groups = function (data, callback) {
    //Do something
}
exports.get_topics = function (data, callback) {
    //Do something
}
exports.send_noti_data_m = function (data, callback) {
    var newdata = JSON.parse(JSON.stringify(data)); //Clone
    newdata.custom_notification = {
        title: 'Sky500',
        body: data.notification_content,
        sound: "default",
        priority: "high",
        show_in_foreground: true
    }
    newdata.notification = {
        title: "Sky500",
        body: data.notification_content,
        sound: "default"
    }
    send_data_mobile(newdata, callback)
}

exports.send_data_m = function (data, callback) {
    send_data_mobile(data, callback)
}
function send_data_mobile(data, callback){
    var db = mongodb.init();
    db.get('user_mapping')
    .find({username: data.received_user })
    .then((result) => {
        if(result &&  result.length>0){
            result.forEach((item, idx, arr)=>{
                var newdata = JSON.parse(JSON.stringify(data)); //Clone
                let body = {
                    to: item.token,
                    data: newdata,
                    priority: "high"
                }
                firebaseClient.send(body, 'notification-lms')
            })
            
        }
    });
}