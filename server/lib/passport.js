var passport = require('passport'),
	BearerStrategy = require('passport-http-bearer').Strategy,
	Token = require('../models/Token');

passport.use(new BearerStrategy(
	function(accessToken, cb) {
		Token.findOne({
			token: accessToken
		}, function(err, data) {
			if (err) {
				return cb(err);
			}
			if (!data) {
				return cb(null, false);
			}
			// to keep this example simple, restricted scopes are not implemented,
			// and this is just for illustrative purposes
			var info = {
				scope: '*'
			};
			//TODO add client only as well
			cb(null, data.userID, info);
		});
	}
));

module.exports = passport;