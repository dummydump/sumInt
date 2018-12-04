var model = require('../models/model');
var PROPERTIES_COLLECTION = model.properties;
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
exports.addProperty = _addProperty;
exports.getPropertyById = _getPropertyById;
exports.getProperties = _getProperties;
exports.updatePropertyById = _updatePropertyById;
exports.removePropertyById = _removePropertyById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new property.
*/
function _addProperty(req, res, next) {
	var json = {};
	var propertyObject = {
		'name': req.body.name,
		'city': req.body.city,
		'country': req.body.country,
		'landmark': req.body.landmark,
		'rating': req.body.rating,
		'lowRate': req.body.lowRate,
		'highRate': req.body.highRate,
		'propertyType': req.body.propertyType,
		'propertyImages': req.body.propertyImages,
		'propertyAmenities': req.body.propertyAmenities
	}

	if (COMMON_ROUTE.isUndefinedOrNull(propertyObject.name)) {
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var property = new PROPERTIES_COLLECTION(propertyObject);

		property.save(function (error, property) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new property!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New property added successfully.', '_id': property._id };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To Update Property By Id
*/
function _updatePropertyById(req, res, next) {
	var propertyId = req.params.id;

	if (!COMMON_ROUTE.isValidId(propertyId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Property Id!' };
		res.send(json);
	} else {
		var propertyObject = {
			'name': req.body.name,
			'city': req.body.city,
			'country': req.body.country,
			'landmark': req.body.landmark,
			'rating': req.body.rating,
			'lowRate': req.body.lowRate,
			'highRate': req.body.highRate,
			'propertyType': req.body.propertyType,
			'propertyImages': req.body.propertyImages,
			'propertyAmenities': req.body.propertyAmenities
		}

		if (COMMON_ROUTE.isUndefinedOrNull(propertyObject.name)) {
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: propertyObject
			};

			PROPERTIES_COLLECTION.find({ _id: new ObjectID(propertyId) }, function (propertyerror, getProperty) {
				if (propertyerror || !getProperty) {
					json.status = '0';
					json.result = { 'message': 'Property not exists!' };
					res.send(json);
				} else {
					PROPERTIES_COLLECTION.update({ _id: new ObjectID(propertyId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating property!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Property updated successfully.', '_id': propertyId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove Property By Id
*/
function _removePropertyById(req, res, next) {
	var propertyId = req.params.id;

	if (!COMMON_ROUTE.isValidId(propertyId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Property Id!' };
		res.send(json);
	} else {
		PROPERTIES_COLLECTION.find({ _id: new ObjectID(propertyId) }, function (propertyerror, getProperty) {
			if (propertyerror || !getProperty) {
				json.status = '0';
				json.result = { 'message': 'Property not exists!' };
				res.send(json);
			} else {
				PROPERTIES_COLLECTION.deleteOne({ _id: new ObjectID(propertyId) }, function (error, result) {
					if (error) {
						json.status = '0';
						json.result = { 'error': 'Error in deleting property!' };
						res.send(json);
					} else {
						json.status = '1';
						json.result = { 'message': 'Property deleted successfully.', '_id': propertyId };
						res.send(json);
					}
				});
			}
		});
	}
}

/*
TODO: GET To get property by Id.
*/
function _getPropertyById(req, res, next) {
	var propertyId = req.params.id;

	if (!COMMON_ROUTE.isValidId(propertyId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Property Id!' };
		res.send(json);
	} else {
		PROPERTIES_COLLECTION.findOne({ _id: new ObjectID(propertyId) }, function (propertyerror, getProperty) {
			if (propertyerror || !getProperty) {
				json.status = '0';
				json.result = { 'message': 'Property not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Property found successfully.', 'property': getProperty };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get properties.
*/
function _getProperties(req, res, next) {
	var query = {};
	var countQuery = {};
	var isFullList = (req.body.isFullList && req.body.isFullList == true)? true : false;
	if(isFullList == true){
		PROPERTIES_COLLECTION.find(query, {name: 1}, function (propertyerror, properties) {
			if (propertyerror || !properties) {
				json.status = '0';
				json.result = { 'message': 'Properties not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Properties found successfully.', 'properties': properties, 'totalRecords': properties.length };
				res.send(json);
			}
		});
	} else {
		var limit = (req.body.limit) ? req.body.limit : 10;
		var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
		var skip = (limit * pageCount);
		var totalRecords = 0;
		var companyNameQuery = {};
		var propertyTypeQuery = {};

		if (req.body.search) {
			search = Object.assign({}, req.body.search)

			if (search) {
				if (search.companyName) {
					companyNameQuery = { 'name': new RegExp(search.companyName, 'i') }
				}
				if (search.propertyType) {
					propertyTypeQuery = { propertyType: { $regex: new RegExp("^" + search.propertyType.toLowerCase(), "i") } };
				}
			}
		}

		var query = countQuery = Object.assign({}, companyNameQuery, propertyTypeQuery);

		PROPERTIES_COLLECTION.count(countQuery, function (err, count) {
			totalRecords = count;

			PROPERTIES_COLLECTION.find(query, function (propertyerror, properties) {
				if (propertyerror || !properties) {
					json.status = '0';
					json.result = { 'message': 'Properties not found!' };
					res.send(json);
				} else {
					json.status = '1';
					json.result = { 'message': 'Properties found successfully.', 'properties': properties, 'totalRecords': totalRecords };
					res.send(json);
				}
			}).skip(skip).limit(limit);
		});
	}
}


