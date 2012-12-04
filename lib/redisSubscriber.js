var colors = require('colors'),
	redis = require("redis"),
	client = redis.createClient(),
	mongoPersistance = require('./mongoPersistance'),
	reportingEvents = {};

client.on("psubscribe", function (pattern, count) {
	console.log("client psubscribed to " + pattern + ", " + count + " total subscriptions");
});

client.on("punsubscribe", function (pattern, count) {
	console.log("client punsubscribed from " + pattern + ", " + count + " total subscriptions");
});

client.on("pmessage", function (pattern, channel, message) {
	console.log("(" + pattern + ")" + " client received message on " + channel + ": " + message);
	reportingEvents[pattern](JSON.parse(message), function (err) {
		console.log(err);
		console.log("event handled by reporter");
	});
});

var addReport = function(message, callback){
	console.log("addReport: " + message);
	mongoPersistance.addViewModel(message, function(err){
		if(err){
			callback(err);
		} else {
			callback(null);
		}
	});
};

var updateReport = function(message, callback){
	console.log("updateReport: " + message);
	mongoPersistance.updateViewModel(message, function(err){
		if(err){
			callback(err);
		} else {
			callback(null);
		}
	});
};

exports.addReportOn = function(eventName, callback){
	// need to set up arrays of add/update/delte etc.
	var pattern = "*:*:" + eventName +":*";
	// will need to check were not already reporting on an event
	reportingEvents[pattern] = addReport;
	client.psubscribe(pattern);
	if(callback){
		return callback(null);
	}
};

// will need to look at having an array of functions for each pattern
// then call each one in order
// this will allow a number of actions to happen when the event is fired.
// e.g. movement will want to be added to user view model and also other area.
exports.updateReportOn = function(eventName, callback){
	var pattern = "*:*:" + eventName +":*";
	reportingEvents[pattern] = updateReport;
	client.psubscribe(pattern);
	if(callback){
		return callback(null);
	}
};

exports.reportOn = function(eventName, functionToCall, callback){
	var pattern = "*:*:" + eventName + ":*";
	reportingEvents[pattern] = functionToCall;
	client.psubscribe(pattern);
	if(callback){
		return callback(null);
	}
};

exports.useMongoWith = function(db){
	mongoPersistance.setup(db);
};