var request = require('supertest'),
	data = require('./data'),
	server = require('../../server');

var login = function(cb) {
	request(server)
		.post('/user/status?action=login')
		.send({
			username: data.USERNAME,
			password: data.PASSWORD,
			remember: false
		})
		.set('Accept', 'application/json')
		.end(function(err, res) {
			if (err)
				cb(null);
			else
				cb(res.body['access_token']);
		});
};

module.exports = login;