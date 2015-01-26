var $ = require('../lib/dollar').$,
	mg = $('mg');

var schema = {
	token: {
		type: String,
		index: true
	},
	expirationDate: {
		type: Date,
		expires: $('config').LOGIN_TOKEN_EXPIRE
	},
	userID: String,
	clientID: Number,
	scope: [String]
};

var Schema = new mg.Schema(schema);
var Model = mg.model('token', Schema);
module.exports = Model;
module.exports.Schema = Schema;