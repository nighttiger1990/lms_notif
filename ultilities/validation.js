var exports = module.exports = {};

exports.validate = function(data, rules, callback) {

    if (!data || typeof data !== 'object' || Object.keys(data).length === 0)
        return callback('Invalid data in');
    if (!rules || typeof rules !== 'object' || Object.keys(data).length === 0)
        return callback('Invalid validation rules');

    var specialDataType = {
        hexString: checkHexString,
        urlString: checkUrlString,
        array: checkArrayObject,
        number: checkNumber
    };
    var necessaryData = {};

    for (var field in rules) {
        if (rules[field].required && (data[field] === '' || data[field] === undefined)) {
            return callback(field + ' is required', null);
        }
        if (data[field] !== undefined && data[field] !== '') {
            if (specialDataType[rules[field].type]) {
                if (!specialDataType[rules[field].type](data[field])) {
                    return callback(field + ' is invalid type: ' + rules[field].type, null);
                }
            } else {
                if (typeof data[field] !== rules[field].type) {
                    return callback(field + ' is invalid type: ' + rules[field].type, null);
                }
            }
            if (rules[field].bound && checkArrayObject(rules[field].bound) && rules[field].bound.length == 2 && typeof rules[field].bound[0] === 'number' && typeof rules[field].bound[1] === 'number') {
                if (data[field].length < rules[field].bound[0] || data[field].length > rules[field].bound[1]) {
                    return callback(field + ' is invalid length, must be between ' + rules[field].bound[0] + ' to ' + rules[field].bound[1], null);
                }
            }
        }
        if (data[field] !== undefined && data[field] !== '')
            necessaryData[field] = data[field];
        else
            necessaryData[field] = rules[field].default;
    }
    return callback(null, necessaryData);
};

function checkHexString(string) {
    if (!string) return true;
    var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    return checkForHexRegExp.test(string);
}

function checkUrlString(string) {
    if (!string) return true;
    var checkForUrlRegExp = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return checkForUrlRegExp.test(string);
}

function checkArrayObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
}

function checkNumber(number){
	if(isNaN(number)) return false;
	try{
		number = parseInt(number);
	}catch(e){
		return false;
	}
	return typeof number === 'number';
}