var model = require('../models/model');
var AIRLINES_COLLECTION = model.airlines;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');
var SUPPLIERS_COLLECTION = model.suppliers;
var CHECKS_COLLECTION = model.checks;
/*-------------------------------------------------------*/
exports.addAirline = _addAirline;
exports.getAirlineById = _getAirlineById;
exports.getAirlines = _getAirlines;
exports.updateAirlineById = _updateAirlineById;
exports.removeAirlineById = _removeAirlineById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new airline.
*/
function _addAirline(req, res, next) {
	var json = {};
	var airlineObject = {
		'name': req.body.name, 
		'IATA': req.body.IATA, 
		'ICAO': req.body.ICAO,
		'callSign': req.body.callSign,
		'alias': req.body.alias,
		'country': req.body.airlineType
	}

	if(COMMON_ROUTE.isUndefinedOrNull(airlineObject.name)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var airline = new AIRLINES_COLLECTION(airlineObject);

		airline.save(function (error, airline) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new airline!' };
				res.send(json);
			} else {

				supplierObject = {
					'name' : airline.name,
					'foreignId' : airline._id
				}
				var supplier = new SUPPLIERS_COLLECTION(supplierObject);

				supplier.save(function(err,supplier){
					if(err)
					{
						AIRLINES_COLLECTION.deleteOne({ _id: new ObjectID(airline._id) });	
						json.status = '0';
						json.result = { 'error': 'Error in adding new Airline!' };
						res.send(json);	
					}
					else
					{
						json.status = '1';
						json.result = { 'message': 'New Airline added successfully.', '_id': airline._id,'suppliersId':supplier._id };
						res.send(json);
					}
				});

			}
		});
	}
}

/*
TODO: POST To Update Airline By Id
*/
function _updateAirlineById(req, res, next) {
	var airlineId = req.params.id;

	if(!COMMON_ROUTE.isValidId(airlineId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Airline Id!' };
		res.send(json);
	} else {
		var airlineObject = {
            'name': req.body.name, 
            'IATA': req.body.IATA, 
            'ICAO': req.body.ICAO,
            'callSign': req.body.callSign,
            'alias': req.body.alias,
            'country': req.body.airlineType
        }

        if(COMMON_ROUTE.isUndefinedOrNull(airlineObject.name)){
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: airlineObject
			};

			AIRLINES_COLLECTION.findOne({ _id: new ObjectID(airlineId)}, function (airlineerror, getAirline) {
				if (airlineerror || !getAirline) {
					json.status = '0';
					json.result = { 'message': 'Airline does not exist!' };
					res.send(json);
				} else {
					AIRLINES_COLLECTION.update({ _id: new ObjectID(airlineId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating airline!' };
							res.send(json);
						} else {

							supplierObject = {
								'name' : airlineObject.name,
								'foreignId' : airlineId
							}
							var query = {
								$set : supplierObject
							}
							SUPPLIERS_COLLECTION.update({foreignId :airlineId },query, function(err,supplierUpd){
								if(err)
								{
									json.status = '0';
									json.result = { 'error': 'Error in updating Airline!' };
									res.send(json);
								}
								else
								{
									json.status = '1';
									json.result = { 'message': 'Airline updated successfully.', '_id': airlineId };
									res.send(json);
								}

							});

						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove Airline By Id
*/
function _removeAirlineById(req, res, next) {
	var airlineId = req.params.id;

	if(!COMMON_ROUTE.isValidId(airlineId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Airline Id!' };
		res.send(json);
	} else { 
		AIRLINES_COLLECTION.findOne({ _id: new ObjectID(airlineId)}, function (airlineerror, getAirline) {
            if (airlineerror || !getAirline) {
                json.status = '0';
                json.result = { 'message': 'Airline does not exist!' };
                res.send(json);
            } else {

				SUPPLIERS_COLLECTION.findOne({foreignId : airlineId},function(err,supplier){
					if(err || !supplier)
					{
						
						AIRLINES_COLLECTION.deleteOne({ _id: new ObjectID(airlineId) }, function (error, result) {
							if (error) {
								json.status = '0';
								json.result = { 'error': 'Error in deleting airline!' };
								res.send(json);
							} else {
								json.status = '1';
								json.result = { 'message': 'Airline deleted successfully.', '_id':airlineId };
								res.send(json);
							}
						});
					}
					else
					{
						CHECKS_COLLECTION.findOne({senderId : supplier._id},function(checkerr,check){
							if(checkerr || !check)
							{
								
								AIRLINES_COLLECTION.deleteOne({ _id: new ObjectID(airlineId) }, function (error, result) {
									if (error) {
										json.status = '0';
										json.result = { 'error': 'Error in deleting airline!' };
										res.send(json);
									} else {
										json.status = '1';
										json.result = { 'message': 'Airline deleted successfully.', '_id':airlineId };
										res.send(json);
									}
								});

							}
							else
							{
								
								json.status = '0';
								json.result = { 'error': 'Check with this AirLine exists!' };
								res.send(json);
							}
						});
					}
				});

            }
		});
	}
}

/*
TODO: GET To get airline by Id.
*/
function _getAirlineById(req, res, next) {
	var airlineId = req.params.id;

	if(!COMMON_ROUTE.isValidId(airlineId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Airline Id!' };
		res.send(json);
	} else { 
		AIRLINES_COLLECTION.findOne({ _id: new ObjectID(airlineId)}, function (airlineerror, getAirline) {
			if (airlineerror || !getAirline) {
				json.status = '0';
				json.result = { 'message': 'Airline does not exist!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Airline found successfully.', 'airline': getAirline };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get airlines.
*/
function _getAirlines(req, res, next) {
	var query = {};
	var countQuery = {};
	var limit = (req.body.limit)? req.body.limit : 10;
	var pageCount = (req.body.pageCount)? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;

	AIRLINES_COLLECTION.count(countQuery,function(err,count){
		totalRecords = count;

		AIRLINES_COLLECTION.find(query, function (airlineerror, airlines) {
			if (airlineerror || !airlines) {
				json.status = '0';
				json.result = { 'message': 'Airlines not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Airlines found successfully.', 'airlines': airlines, 'totalRecords':totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});
}