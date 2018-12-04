var model = require('../models/model');
var TRIP_ACTIVITIES_COLLECTION = model.trip_activities;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');

/*-------------------------------------------------------*/
exports.addTripActivity = _addTripActivity;
exports.getTripActivityById = _getTripActivityById;
exports.getTripActivities = _getTripActivities;
exports.getAllTripActivities = _getAllTripActivities;
exports.updateTripActivityById = _updateTripActivityById;
exports.removeTripActivityById = _removeTripActivityById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new trip activity.
*/
function _addTripActivity(req, res, next) {
	var json = {};
	var tripActivityObject = {
		'tripId': req.body.tripId,
		'activity': req.body.activity,
		'activityDate': req.body.activityDate,
		'activityTime': req.body.activityTime,
		'activityName': req.body.activityName,
		'confirmationNumber': req.body.confirmationNumber,
		'description': req.body.description
	}

	if (COMMON_ROUTE.isUndefinedOrNull(tripActivityObject.tripId) || COMMON_ROUTE.isUndefinedOrNull(tripActivityObject.activity) || COMMON_ROUTE.isUndefinedOrNull(tripActivityObject.activityDate) ) {
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var trip_activity = new TRIP_ACTIVITIES_COLLECTION(tripActivityObject);

		trip_activity.save(function (error, trip) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new trip activity activity!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New trip activity added successfully.', '_id': trip._id };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To Update TripActivity By Id
*/
function _updateTripActivityById(req, res, next) {
	var tripId = req.params.id;

	if (!COMMON_ROUTE.isValidId(tripId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid TripActivity Id!' };
		res.send(json);
	} else {
		var tripActivityObject = {
			'tripId': req.body.tripId,
			'activity': req.body.activity,
			'activityDate': req.body.activityDate,
			'activityTime': req.body.activityTime,
			'activityName': req.body.activityName,
			'confirmationNumber': req.body.confirmationNumber,
			'description': req.body.description
		}

		if (COMMON_ROUTE.isUndefinedOrNull(tripActivityObject.tripId) || COMMON_ROUTE.isUndefinedOrNull(tripActivityObject.activity) || COMMON_ROUTE.isUndefinedOrNull(tripActivityObject.activityDate) ) {
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: tripActivityObject
			};

			TRIP_ACTIVITIES_COLLECTION.find({ _id: new ObjectID(tripId) }, function (triperror, getTripActivity) {
				if (triperror || !getTripActivity) {
					json.status = '0';
					json.result = { 'message': 'Trip Activity not exists!' };
					res.send(json);
				} else {
					TRIP_ACTIVITIES_COLLECTION.update({ _id: new ObjectID(tripId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating trip activity!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Trip Activity updated successfully.', '_id': tripId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove TripActivity By Id
*/
function _removeTripActivityById(req, res, next) {
	var tripId = req.params.id;

	if (!COMMON_ROUTE.isValidId(tripId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid TripActivity Id!' };
		res.send(json);
	} else {
		TRIP_ACTIVITIES_COLLECTION.find({ _id: new ObjectID(tripId) }, function (triperror, getTripActivity) {
			if (triperror || !getTripActivity) {
				json.status = '0';
				json.result = { 'message': 'TripActivity not exists!' };
				res.send(json);
			} else {
				TRIP_ACTIVITIES_COLLECTION.deleteOne({ _id: new ObjectID(tripId) }, function (error, result) {
					if (error) {
						json.status = '0';
						json.result = { 'error': 'Error in deleting trip activity!' };
						res.send(json);
					} else {
						json.status = '1';
						json.result = { 'message': 'Trip Activity deleted successfully.', '_id': tripId };
						res.send(json);
					}
				});
			}
		});
	}
}

/*
TODO: GET To get trip activity by Id.
*/
function _getTripActivityById(req, res, next) {
	var tripId = req.params.id;

	if (!COMMON_ROUTE.isValidId(tripId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid TripActivity Id!' };
		res.send(json);
	} else {
		TRIP_ACTIVITIES_COLLECTION.findOne({ _id: new ObjectID(tripId) }, function (triperror, getTripActivity) {
			if (triperror || !getTripActivity) {
				json.status = '0';
				json.result = { 'message': 'TripActivity not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'TripActivity found successfully.', 'trip': getTripActivity };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get trip activities.
*/
function _getTripActivities(req, res, next) {
	var _tripId = req.body.tripId;
	var query = {
		"tripId":_tripId
	};
	
	var countQuery = {
		"tripId":_tripId
	};
	var limit = (req.body.limit) ? req.body.limit : 10;
	var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;

	/*TRIP_ACTIVITIES_COLLECTION.count(countQuery, function (err, count) {
		totalRecords = count;*/

		TRIP_ACTIVITIES_COLLECTION.find(query, function (triperror, trips) {
			if (triperror || !trips) {
				json.status = '0';
				json.result = { 'message': 'TripActivitys not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'TripActivitys found successfully.', 'trips': trips, 'totalRecords':totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	//});
}

/*
TODO: POST To get all trip's activities.
*/
function _getAllTripActivities(req, res, next) {
	var _tripId = req.body.tripId;
	var query = {
		"tripId":_tripId
	};
	
	var countQuery = {
		"tripId":_tripId
	};
	var totalRecords = 0;

	/*TRIP_ACTIVITIES_COLLECTION.count(countQuery, function (err, count) {
		totalRecords = count;*/

		TRIP_ACTIVITIES_COLLECTION.find(query, function (triperror, trips) {
			if (triperror || !trips) {
				json.status = '0';
				json.result = { 'message': 'TripActivitys not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'TripActivitys found successfully.', 'tripactivities': trips, 'totalRecords':trips.length };
				res.send(json);
			}
		});
	//});
}

