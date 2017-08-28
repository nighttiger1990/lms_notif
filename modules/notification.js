var path = require('path');
var async = require('async');
var mongodb = require(path.join(__dirname, '/mongodb.js'));

var exports = module.exports = {};

exports.save = function(data, callback) {
    var db = mongodb.init();
    if (data._id) {
        async.series({
            checkExist: function(callback) {
                db.get(data.received_system + '_notifications').findOne({
                    _id: data._id
                }, function(error, result) {
                    if (error) return callback(JSON.stringify(error), null);
                    else if (!result) return callback('Not exist notification', null);
                    else {
                        old_notification = result;
                        return callback(null, null);
                    }
                });
            },
            update: function(callback) {

                var current_time = new Date();
                var saveID = old_notification._id.toHexString();
                delete old_notification._id;
                delete data._id;

                for (var updatingField in data) {
                    old_notification[updatingField] = data[updatingField];
                }

                if (old_notification.notification_viewed) {
                    old_notification.view_notification_date_time = current_time;
                } else {
                    old_notification.view_notification_date_time = null;
                }

                if (old_notification.detail_viewed) {
                    old_notification.view_detail_date_time = current_time;
                } else {
                    old_notification.view_detail_date_time = null;
                }

                db.get(data.received_system + '_notifications').update({
                    _id: saveID
                }, old_notification, function(error, result) {
                    if (error) return callback(JSON.stringify(error), null);
                    else return callback(null, result);
                });
            }
        }, function(err, results) {
            db.close();
            if (err) return callback(err, null);
            else return callback(null, results.update);
        });
    } else {

        //addition values
        var current_time = new Date();
        data.creation_date_time = current_time;
        data.view_notification_date_time = null;
        data.view_detail_date_time = null;
        data.notification_viewed = false;
        data.detail_viewed = false;

        db.get(data.received_system + '_notifications').insert(data, function(error, result) {
            db.close();
            if (error) return callback(JSON.stringify(error), null);
            else return callback(null, result);
        });
    }
};

exports.delete = function(data, callback) {
    return callback(null, null);
};

exports.count = function(data, callback) {
    var db = mongodb.init();
    db.get(data.received_system + '_notifications').find(data, function(error, result) {
        db.close();
        if (error) return callback(JSON.stringify(error), null);
        else if (!result) return callback(null, 0);
        else {
            return callback(null, result.length);
        }
    });
};

exports.browse = function(data, callback) {
    var db = mongodb.init();
    var page = parseInt(data.page);
    var itemPerPage = parseInt(data.itemPerPage);
    delete data.page;
    delete data.itemPerPage;
    db.get(data.received_system + '_notifications').find(data, {
        skip: (page - 1) * itemPerPage,
        limit: itemPerPage,
        sort: {
            creation_date_time: -1
        }
    }, function(error, result) {
        db.close();
        if (error) return callback(JSON.stringify(error), null);
        else if (!result) return callback(null, []);
        else {
            if (page === 1)
                updateViewedNotifications(data, function(error, result) {});
            return callback(null, result);
        }
    });
};

exports.updateDetailViewedNotifications = function(data, callback) {
    var db = mongodb.init();
    var unviewed_detail_notifications = [];
    data.detail_viewed = false;
    async.series({
        getUnviewdDetail: function(callback) {
            db.get(data.received_system + '_notifications').find(data, function(error, result) {
                if (error) return callback(JSON.stringify(error), null);
                else if (!result) return callback('No detail viewed update needed', null);
                else {
                    unviewed_detail_notifications = result;
                    return callback(null, null);
                }
            });
        },
        updateViewedDetail: function(callback) {

            var totalViewedDetailUpdate = 0;

            async.eachLimit(unviewed_detail_notifications, 100, function(notification, callback) {
                var current_time = new Date();
                var saveID = notification._id.toHexString();
                delete notification._id;
                notification.detail_viewed = true;
                notification.view_detail_date_time = current_time;

                db.get(data.received_system + '_notifications').update({
                    _id: saveID
                }, notification, function(error, result) {
                    if (error) {
                        //skip error
                        return callback(null, null);
                    } else {
                        totalViewedDetailUpdate += 1;
                        return callback(null, result);
                    }
                });
            }, function(error) {
                if (error) {
                    return callback(error, null);
                } else {
                    return callback(null, totalViewedDetailUpdate);
                }
            });
        }
    }, function(err, results) {
        db.close();
        if (err) return callback(err, null);
        else return callback(null, results.updateViewedDetail);
    });
}

function updateViewedNotifications(data, callback) {
    var db = mongodb.init();
    var unviewed_notifications = [];
    data.notification_viewed = false;
    async.series({
        getUnviewd: function(callback) {
            db.get(data.received_system + '_notifications').find(data, function(error, result) {
                if (error) return callback(JSON.stringify(error), null);
                else if (!result) return callback('No viewed update needed', null);
                else {
                    unviewed_notifications = result;
                    return callback(null, null);
                }
            });
        },
        updateViewed: function(callback) {

            var totalViewedUpdate = 0;

            async.eachLimit(unviewed_notifications, 100, function(notification, callback) {
                var current_time = new Date();
                var saveID = notification._id.toHexString();
                delete notification._id;
                notification.notification_viewed = true;
                notification.view_notification_date_time = current_time;

                db.get(data.received_system + '_notifications').update({
                    _id: saveID
                }, notification, function(error, result) {
                    if (error) {
                        //skip error
                        return callback(null, null);
                    } else {
                        totalViewedUpdate += 1;
                        return callback(null, result);
                    }
                });
            }, function(error) {
                if (error) {
                    return callback(error, null);
                } else {
                    return callback(null, totalViewedUpdate);
                }
            });
        }
    }, function(err, results) {
        db.close();
        if (err) return callback(err, null);
        else return callback(null, results.updateViewed);
    });
}
