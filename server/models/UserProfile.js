var $ = require('../lib/dollar').$,
	mg = $('mg');

var schema = {
	avatar: String
};

var Schema = new mg.Schema(schema);
var Model = mg.model('user_profile', Schema);
module.exports = Model;
module.exports.Schema = Schema;