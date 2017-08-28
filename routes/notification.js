var path = require('path');
var async = require('async');
var notification = require(path.join(__dirname, '../', 'modules/notification.js'));
var requestHandling = require(path.join(__dirname, '../', 'ultilities/requestHandling.js'));

module.exports = function(app, io) {
    app.post('/api/notification/create', function(req, res) {
        if (Object.prototype.toString.call(req.body) !== '[object Array]' || req.body.length === 0) {
            res.json({
                status: 0,
                message: 'Invalid send data'
            });
        } else {
            var totalHandleSuccess = 0;
            async.eachLimit(req.body, 100, function(data_block, callback) {
                requestHandling.handleRequest(data_block, {
                    send_system: {
                        type: 'string',
                        required: true,
                        bound: null,
                        default: null,
                    },
                    send_user: {
                        type: 'string',
                        required: true,
                        bound: null,
                        default: null,
                    },
                    received_system: {
                        type: 'string',
                        required: true,
                        bound: null,
                        default: null,
                    },
                    received_user: {
                        type: 'string',
                        required: true,
                        bound: null,
                        default: null,
                    },
                    action: {
                        type: 'string',
                        required: true,
                        bound: null,
                        default: null,
                    },
                    notification_content: {
                        type: 'string',
                        required: true,
                        bound: [0, 1000],
                        default: null,
                    },
                    notification_link: {
                        type: 'urlString',
                        required: true,
                        bound: null,
                        default: null,
                    }
                }, notification.save, function(error, result) {
                    if (error) {
                        //skip error
                        return callback(null, null);
                    } else {
                        totalHandleSuccess += 1;
                        if (result.received_user && result.received_system) {
                            io.to(result.received_user + '_' + result.received_system).emit('newNotification', result);
                        }
                        return callback(null, null);                      
                    }
                });
            }, function(error) {
                if (error) {
                    res.json({
                        status: 0,
                        message: error
                    });
                } else {
                    res.json({
                        status: 200,
                        total: totalHandleSuccess,
                        message: 'Notifications are created sucessfully'
                    });
                }
            });
        }
    });
    app.get('/api/notification/count_unviewed', function(req, res) {
        requestHandling.handleRequest(req.query, {
            received_system: {
                type: 'string',
                required: true,
                bound: null,
                default: null,
            },
            received_user: {
                type: 'string',
                required: true,
                bound: null,
                default: null,
            },
            notification_viewed: {
                type: 'boolean',
                required: false,
                bound: null,
                default: false,
            }
        }, notification.count, function(error, result) {
            if (error) {
                res.json({
                    status: 0,
                    message: error
                });
            } else {
                res.json({
                    status: 200,
                    total: result
                });
            }
        });
    });
    app.get('/api/notification/browse', function(req, res) {                
        requestHandling.handleRequest(req.query, {
            received_system: {
                type: 'string',
                required: true,
                bound: null,
                default: null,
            },
            received_user: {
                type: 'string',
                required: true,
                bound: null,
                default: null,
            },
            page: {
                type: 'number',
                required: false,
                bound: null,
                default: 1,
            },
            itemPerPage: {
                type: 'number',
                required: false,
                bound: null,
                default: 10,
            }
        }, notification.browse, function(error, result) {             
            if (error) {
                res.json({
                    status: 0,
                    message: error
                });
            } else {
                res.json({
                    status: 200,
                    notifications: result
                });
            }
        });
    });
    app.get('/api/notification/update_detail_viewed', function(req, res) {
        requestHandling.handleRequest(req.query, {
            received_system: {
                type: 'string',
                required: true,
                bound: null,
                default: null,
            },
            _id: {
                type: 'hexString',
                required: true,
                bound: null,
                default: null,
            },
            detail_viewed: {
                type: 'boolean',
                required: false,
                bound: null,
                default: true,
            }
        }, notification.save, function(error, result) {
            if (error) {
                res.json({
                    status: 0,
                    message: error
                });
            } else {
                res.json({
                    status: 200,
                    message: 'Notification\'s detail viewed status updated successfully'
                });
            }
        });
    });
    app.get('/api/notification/update_all_detail_viewed', function(req, res) {
        requestHandling.handleRequest(req.query, {
            received_system: {
                type: 'string',
                required: true,
                bound: null,
                default: null,
            },
            received_user: {
                type: 'string',
                required: true,
                bound: null,
                default: null,
            }
        }, notification.updateDetailViewedNotifications, function(error, result) {
            if (error) {
                res.json({
                    status: 0,
                    message: error
                });
            } else {
                res.json({
                    status: 200,
                    total: result,
                    message: 'Notifications marked detail viewed status updated successfully'
                });
            }
        });
    });
};
