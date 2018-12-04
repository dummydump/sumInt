var model = require('../models/model');
var TOURS_COLLECTION = model.tours;
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
exports.addTour = _addTour;
exports.getTourById = _getTourById;
exports.getTours = _getTours;
exports.updateTourById = _updateTourById;
exports.removeTourById = _removeTourById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new Tour.
*/
function _addTour(req, res, next) {
	var json = {};
	var TourObject = {
		'TourKey': req.body.TourKey,
		'TourValues': req.body.TourValues
	}

	if (COMMON_ROUTE.isUndefinedOrNull(TourObject.TourKey)) {
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var Tour = new TourS_COLLECTION(TourObject);

		Tour.save(function (error, Tour) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new Tour!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New Tour added successfully.', '_id': Tour._id };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To Update Tour By Id
*/
function _updateTourById(req, res, next) {
	var TourId = req.params.id;

	if (!COMMON_ROUTE.isValidId(TourId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Tour Id!' };
		res.send(json);
	} else {
		var tourObject = {
			'tourKey': req.body.tourKey,
			'tourValues': req.body.tourValues
		}

		if (COMMON_ROUTE.isUndefinedOrNull(tourObject.tourKey)) {
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: tourObject
			};

			TOURS_COLLECTION.find({ _id: new ObjectID(tourId) }, function (tourerror, getTour) {
				if (tourerror || !getTour) {
					json.status = '0';
					json.result = { 'message': 'Tour not exists!' };
					res.send(json);
				} else {
					TOURS_COLLECTION.update({ _id: new ObjectID(tourId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating tour!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Tour updated successfully.', '_id': TourId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove Tour By Id
*/
function _removeTourById(req, res, next) {
	var tourId = req.params.id;

	if (!COMMON_ROUTE.isValidId(tourId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Tour Id!' };
		res.send(json);
	} else {
		TOURS_COLLECTION.find({ _id: new ObjectID(tourId) }, function (tourerror, getTour) {
			if (tourerror || !getTour) {
				json.status = '0';
				json.result = { 'message': 'Tour not exists!' };
				res.send(json);
			} else {
				TOURS_COLLECTION.deleteOne({ _id: new ObjectID(tourId) }, function (error, result) {
					if (error) {
						json.status = '0';
						json.result = { 'error': 'Error in deleting tour!' };
						res.send(json);
					} else {
						json.status = '1';
						json.result = { 'message': 'Tour deleted successfully.', '_id': tourId };
						res.send(json);
					}
				});
			}
		});
	}
}

/*
TODO: GET To get tour by Id.
*/
function _getTourById(req, res, next) {
	var tourId = req.params.id;

	if (!COMMON_ROUTE.isValidId(tourId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Tour Id!' };
		res.send(json);
	} else {
		TOURS_COLLECTION.findOne({ _id: new ObjectID(tourId) }, function (tourerror, getTour) {
			if (tourerror || !getTour) {
				json.status = '0';
				json.result = { 'message': 'Tour not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Tour found successfully.', 'tour': getTour };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get tours.
*/
function _getTours(req, res, next) {
	var query = {};
	var countQuery = {};
	var limit = (req.body.limit) ? req.body.limit : 10;
	var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;

	TOURS_COLLECTION.count(countQuery, function (err, count) {
		totalRecords = count;

		TOURS_COLLECTION.find(query, function (tourerror, tours) {
			if (tourerror || !tours) {
				json.status = '0';
				json.result = { 'message': 'Tours not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Tours found successfully.', 'tours': tours, 'totalRecords':totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});
	
}