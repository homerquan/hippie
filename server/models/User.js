var $ = require('../lib/dollar').$,
	UserProfile = require('./UserProfile'),
	Verification = require('./Verification'),
	mg = $('mg');

var schema = {
	username: {
		type: String,
		index: {
			unique: true
		}
	},
	email: {
		type: String,
		index: {
			unique: true
		}
	},
	password: String,
	firstname: String,
	lastname: String,
	profile: {
		type: mg.Schema.ObjectId,
		ref: 'user_profile'
	},
	verified: {
		type: Boolean,
		default: false
	}
};

var Schema = new mg.Schema(schema);

Schema.static('findByEmail', function(email, cb) {
	this.findOne({
		email: email
	}, cb);
});

Schema.static('setVerification', function(id, cb) {
	this.findByIdAndUpdate(id, {
		$set: {
			verified: true
		}
	}, cb);
});

Schema.static('sendPasswordReset', function(doc, cb) {
	var ver = new Verification({
		userID: doc._id,
		email: doc.email,
		type: 'password'
	});
	ver.save(cb);
});

// post save middleware for send email notice
Schema.post('save', function(doc) {
	var ver = new Verification({
		userID: doc._id,
		email: doc.email,
		type: 'email'
	});
	ver.save();
});

var Model = mg.model('user', Schema);
module.exports = Model;
module.exports.Schema = Schema;