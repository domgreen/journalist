var //!
ObjectID = require('mongodb').ObjectID,
	mongodb = require("mongodb"),
	BSON = require('mongodb').BSON,
	db;


exports.setup = function (database) {
	console.log("setting up reporter");
	db = database;
};

var addViewModel = function (data, callback) {
		// check data has an aggregate type
		var aggregateType = data.aggregateType;
		var aggregateId = data.aggregateId;
		if(!aggregateType) {
			callback("No aggregate type was supplied with the event");
		} else {
			// this is to get rid of any unneeded data
			delete data.version;
			delete data.eventName;
			delete data.aggregateId;
			delete data.aggregateType;

			console.log("id: " + aggregateId);
			data._id = aggregateId;
			console.log("_id: " + data._id);
			console.log("adding: " + JSON.stringify(data));
			db.collection(aggregateType, function (error, aggregateCollection) {
				if(error) return callback(error);
				aggregateCollection.insert(data, function (err, data) {
					if(err) return callback(err);
					callback(null);
				});
			});
		}
	};

exports.addViewModel = addViewModel;

var updateViewModel = function (data, callback) {
		// check data has an aggregate type
		var aggregateType = data.aggregateType;
		var aggregateId = data.aggregateId;
		if(!aggregateType) {
			callback("No aggregate type was supplied with the event");
		} else {
			// this is to get rid of any unneeded data
			delete data.version;
			delete data.eventName;
			delete data.aggregateId;
			delete data.aggregateType;
			db.collection(aggregateType, function (error, aggregateCollection) {
				if(error) return callback(error);
				var id = aggregateId;
				console.log(id);
				console.log(data);
				aggregateCollection.update({
					_id: id
				}, {
					$set: data
				}, {
					safe: true
				}, function (err, data) {
					if(err) return callback(err);
					console.log("done update: " + data);
					callback(null);
				});
			});
		}
	};

exports.updateViewModel = updateViewModel;