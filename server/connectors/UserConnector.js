var $ = require('../lib/dollar').$,
	BaseConnector = require('./BaseConnector');


var userSchema = $('mg').Schema({
	id: Number,
	username: {
		type: String,
		index: true
	},
	email: String,
	password: String,
	name: String,
	image: String
});

var userModel = $('mg').model('user', userSchema);

var UserConnector = function() {
	$('util').inherits(this, BaseConnector);
	BaseConnector.call(this);
	this.model = userModel;
	this.getUserById = function(id, cb) {
		this.model.findOne({
			id: id
		}, function(err, data) {
			cb(err, data);
		});
	};
};


module.exports = UserConnector;