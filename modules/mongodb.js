var path = require('path');
var config = require(path.join(__dirname, '../' , 'config.json'));

var exports = module.exports = {};

exports.init = function() {
    return require('monk')(config.mongo_url);
};