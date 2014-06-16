var $ = require('../lib/dollar').$,
	BaseConnector = require('./BaseConnector');


var tokenSchema = $('mg').Schema({
	token: {
		type: String,
		index: true
	},
	expirationDate: {
		type: Date,
		expires: 60 * 60 * 24
	},
	userID: Number,
	clientID: Number,
	scope: [String]
});

var tokenModel = $('mg').model('token', tokenSchema);

var TokenConnector = function() {
	$('util').inherits(this, BaseConnector);
	BaseConnector.call(this);
	this.model = tokenModel;
	this.getToken = function(token, cb) {
		this.model.findOne({
			token: token
		}, function(err, data) {
			cb(err, data);
		});
	};
};


module.exports = TokenConnector;