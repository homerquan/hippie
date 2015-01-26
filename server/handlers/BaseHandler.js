/**
 *
 * Base handler  to be inherited
 *
 **/

var $ = require('../lib/dollar').$;

function BaseHandler(ctx) {
	this.get = function(context) {
		context.res.json(405, $('errors')["ERR_NO_METHOD"]);
	};
	this.post = function(context) {
		context.res.json(405, $('errors')["ERR_NO_METHOD"]);
	};
	this.put = function(context) {
		context.res.json(405, $('errors')["ERR_NO_METHOD"]);
	};
	this.delete = function(context) {
		context.res.json(405, $('errors')["ERR_NO_METHOD"]);
	};
	var getMeta = function(context) {};
	var wrapData = function(data, meta) {
		return {
			meta: meta,
			data: data
		};
	};
	this.send = function(context, err, data, statusCode, noWrap) {
		var sendData = {};
		if (noWrap) {
			sendData = data;
		} else {
			sendData = wrapData(data);
		}
		// Set default statusCode 200/400 depends on err
		if (!statusCode) {
			statusCode = err ? 400 : 200;
		}
		if (statusCode === 200 && !err) {
			context.res.status(200).json(sendData);
		} else {
			var error = $('errors')["ERR_GENERAL"];
			//internal error
			if (err && err.code < 100) {
				error = err;
			} else {
				// Convert mongodb errors
				if (err && err.code === 11000) {
					error = $('errors')["ERR_EXISTS"];
					error.message = err.message.match('dup key: { : "(.+)" }')[1] + " is used";
				}
			}
			// Dump originoal error for develping only
			if ($('config').DUMP_ERROR_TO_CLIENT)
				error.dump = JSON.stringify(err);
			context.res.status(statusCode || 400).json(error);
		}
	};
	/**
	 * Put express validator errors into one string
	 * @param  Array err An Array of {"param":"...","msg":"...","value":"..."}
	 * @return String    A string combining err msgs by ","
	 */
	this.getCheckError = function(err) {
		var errMsg = '';
		errMsg = err.map(function(e) {
			return e.msg;
		}).reduce(function(prev, next) {
			return prev + "," + next;
		});
		return errMsg;
	};
}

module.exports = BaseHandler;