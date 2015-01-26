var Promise = require('promise'),
	nodemailer = require("nodemailer"),
	sendmailTransport = require('nodemailer-sendmail-transport'),
	templatesDir = require('path').join(__dirname, '../..', 'emails'),
	emailTemplates = require('email-templates');

var emailer = nodemailer.createTransport(sendmailTransport({
	path: '/usr/sbin/sendmail'
}));

/* send email with pre-defined template
 * @param {string} options, this is a mixing object with type (name of template) and data
 * @return {promise}
 */
var send = function(options) {
	return new Promise(function(fulfill, reject) {
		emailTemplates(templatesDir, function(err, template) {
			if (err) {
				reject(err);
			}
			template(options.type, options, function(err, html, text) {
				if (err) {
					reject(err);
				}
				var mailOptions = {
					from: options.sender,
					to: options.email,
					subject: options.subject,
					html: html,
					text: text
				};
				emailer.sendMail(mailOptions, function(err, responseStatus) {
					if (err) {
						reject(err);
					} else {
						fulfill(responseStatus.message);
					}
				});
			});
		});
	});
};

module.exports = emailer;
module.exports.send = send;