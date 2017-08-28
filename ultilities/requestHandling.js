var async = require('async');
var path = require('path');
var validationObj = require(path.join(__dirname, '/validation.js'));
var loggerObj = require(path.join(__dirname, '/logger.js'));

var exports = module.exports = {};

exports.handleRequest = function(dataIn, validationRules, functionCall, callback) {
    var handlingData = {};
    console.log("test3");
    async.series({
        validate: function(callback) {
            validationObj.validate(dataIn, validationRules, function(error, result) {
                if (error) {
                    return callback(error, null);
                } else {
                    handlingData = result;
                    return callback(null, null);
                }
            });
        },
        handle: function(callback) {
            functionCall(handlingData, function(error, result) {
                if (error) {
                    return callback(error, null);
                } else {
                    return callback(null, result);
                }
            });
        }
    }, function(error, results) {
        console.log(error);
        console.log(results);
        
        if (error) {
            loggerObj.getLogger().error(error);
            return callback(error, null);
        } else {
            return callback(null, results.handle);
        }
    });
};
