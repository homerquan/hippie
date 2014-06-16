var passport = require('passport'),
	BearerStrategy = require('passport-http-bearer').Strategy,
	TokenConnector = require('../connectors/TokenConnector');

var connector = new TokenConnector();

passport.use(new BearerStrategy(
	function(accessToken, cb) {
		connector.getToken(accessToken, function(err, data) {
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