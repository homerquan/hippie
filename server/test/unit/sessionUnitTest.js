var request = require('supertest'),
	assert = require('assert'),
	login = require('../util/login'),
	data = require('../util/data'),
	server = require('../../server');

var accessToken = '';

//test cases
describe('login API: username', function() {
	describe('POST /user/status?action=login', function() {
		it('should return an item', function(done) {
			request(server)
				.post('/user/status?action=login')
				.send({
					username: data.USERNAME,
					password: data.PASSWORD,
					remember: false
				})
				.set('Accept', 'application/json')
				.expect(200, done);
		});
	});
});

describe('login API: email', function() {
	describe('POST /user/status?action=login', function() {
		it('should return an item', function(done) {
			request(server)
				.post('/user/status?action=login')
				.send({
					username: data.EMAIL,
					password: data.PASSWORD,
					remember: false
				})
				.set('Accept', 'application/json')
				.expect(200, done);
		});
	});
});

describe('logout API', function() {
	describe('POST /user/status?action=logout', function() {
		before(function(done) {
			login(function(token) {
				accessToken = token;
				done();
			});
		});
		it('should return an item', function(done) {
			request(server)
				.post('/user/status?action=logout')
				.set('Authorization', 'bearer ' + accessToken)
				.expect(200, done);
		});
	});
});