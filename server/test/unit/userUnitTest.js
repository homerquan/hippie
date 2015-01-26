var request = require('supertest'),
	assert = require('assert'),
	login = require('../util/login'),
	data = require('../util/data'),
	server = require('../../server');

var accessToken = '';

//test cases
describe('me API', function() {
	describe('GET /me', function() {
		before(function(done) {
			login(function(token) {
				accessToken = token;
				done();
			});
		});
		it('should return an item', function(done) {
			request(server).get('/me')
				.set('Authorization', 'bearer ' + accessToken)
				.expect(200, done);
		});
	});
});