var request = require('supertest'),
	assert = require('assert'),
	login = require('../util/login'),
	data = require('../util/data'),
	server = require('../../server');

var accessToken = '';

describe('suggestion API', function() {
	describe('GET /suggestion?q=java', function() {
		it('should return an array', function(done) {
			request(server)
				.get('/suggestion?q=java')
				.expect(200, done);
		});
	});
});

describe('logout API', function() {
	describe('GET /search?q=java', function() {
		before(function(done) {
			login(function(token) {
				accessToken = token;
				done();
			});
		});
		it('should return an item', function(done) {
			request(server)
				.get('/search?q=java')
				.set('Authorization', 'bearer ' + accessToken)
				.expect(200, done);
		});
	});
});