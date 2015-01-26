var $ = require('../lib/dollar').$,
	UserSchema = require('./User').Schema,
	mg = $('mg');

var schema = {
	token: {
		type: String,
		index: true,
		default: $('genToken')($('config').VERIFY_TOKEN_SIZE)
	},
	type: {
		type: String,
		index: true
	},
	email: {
		type: String
	},
	expirationDate: {
		type: Date,
		expires: $('config').VERIFICATION_EXPIRE
	},
	userID: String,
	used: {
		type: Boolean,
		default: false,
		index: true
	}
};
var Schema = new mg.Schema(schema);
var Model = mg.model('verification', Schema);

Schema.statics.verifyUser = function(token, cb) {
	this.findOne({
		token: token
	}, function(err, doc) {
		if (!err)
			UserSchema.setVerification(doc.userID, cb);
		else
			cb(err, null);
	});
};

//send different notifications by verification type
Schema.post('save', function(doc) {
	var options = {};
	if (doc && doc.type) {
		if (doc.type === 'email') {
			options = {
				type: 'register-confirm',
				email: doc.email,
				sender: $('config').DEFAULT_REPLY_EMAIL,
				subject: 'Welcome to Reflen',
				link: $('config').FE_PROTOCOL + '://' + $('config').FE_HOSTNAME + '/' + $('config').FE_VERIFY_EMAIL_PATH + '/' + doc.token
			};
		} else if (doc.type === 'password') {
			options = {
				type: 'reset-password',
				email: doc.email,
				sender: $('config').DEFAULT_REPLY_EMAIL,
				subject: 'Reset Reflen password',
				link: $('config').FE_PROTOCOL + '://' + $('config').FE_HOSTNAME + '/' + $('config').FE_RESET_PASS_PATH + '/' + doc.token
			};
		}
		if (options) {
			$('emailer').send(options).then($('logger').log, $('logger').error);
		}
	}
});

module.exports = Model;
module.exports.Schema = Schema;