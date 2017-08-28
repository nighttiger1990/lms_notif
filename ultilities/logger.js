var exports = module.exports = {};

exports.getLogger = function() {
    var winston = require('winston');
    var logger = new(winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                handleExceptions: true,
                json: true
            }),
            new(winston.transports.File)({
                filename: 'logs/' + getDate() + 'notification-server.log'
            })
        ]
    });
    return logger;
};

function getDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return '[' + year + "_" + month + "_" + day + ']';
}
