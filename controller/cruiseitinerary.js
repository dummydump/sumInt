var model = require('../models/model');
var CRUISE_LINES_COLLECTION = model.cruise_lines;
var CRUISE_ITINERARIES_COLLECTION = model.cruise_itineraries;
var PORT_COLLECTION = model.ports;
var SHIP_COLLECTION = model.ships;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');
var async = require('async');


/*----------------------------------------------------------------*/
exports.addCruiseItinerary = _addCruiseItinerary;
exports.updateCruiseItineraryById = _updateCruiseItineraryById;
exports.removeCruiseItineraryById = _removeCruiseItineraryById;
exports.getCruiseItineraryById = _getCruiseItineraryById;
exports.getAllCruiseItinerariesByTitle = _getAllCruiseItinerariesByTitle;
exports.checkItineraryByCruiseId = _checkItineraryByCruiseId;
/*----------------------------------------------------------------*/



/*
TODO: POST To add new cruiseitinerary.
*/
function _addCruiseItinerary(req, res, next) {
	var json = {};
	var cruiseItineraryObject = {
		'cruise_line_id': req.body.cruise_line_id,
		'title': req.body.title,
		'shipId': req.body.shipId,
		'departure_port_id': req.body.departure_port_id,
		'no_of_day': req.body.no_of_day,
		'itinerary': req.body.itinerary,
		'price': req.body.price,
		'descriptionHTML': req.body.descriptionHTML,
	}

	if (COMMON_ROUTE.isUndefinedOrNull(cruiseItineraryObject.title)) {
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var cruiseItinerary = new CRUISE_ITINERARIES_COLLECTION(cruiseItineraryObject);

		cruiseItinerary.save(function (error, cruiseItinerary) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new cruiseItinerary!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New cruiseItinerary added successfully.', '_id': cruiseItinerary._id };
				res.send(json);
			}
		});
	}
}


/*
TODO: POST To Update CruiseItinerary By Id
*/
function _updateCruiseItineraryById(req, res, next) {
	var cruiseItineraryId = req.params.id;

	if (!COMMON_ROUTE.isValidId(cruiseItineraryId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Cruise Itinerary Id!' };
		res.send(json);
	} else {

		var cruiseItineraryObject = {
			'cruise_line_id': req.body.cruise_line_id,
			'title': req.body.title,
			'shipId': req.body.shipId,
			'departure_port_id': req.body.departure_port_id,
			'no_of_day': req.body.no_of_day,
			'itinerary': req.body.itinerary,
			'price': req.body.price,
			'descriptionHTML': req.body.descriptionHTML,
		}

		if (COMMON_ROUTE.isUndefinedOrNull(cruiseItineraryObject.title)) {
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: cruiseItineraryObject
			};

			CRUISE_ITINERARIES_COLLECTION.find({ _id: new ObjectID(cruiseItineraryId) }, function (cruiseItineraryerror, getCruiseItinerary) {
				if (cruiseItineraryerror || (!getCruiseItinerary)) {
					json.status = '0';
					json.result = { 'message': 'Cruise Itinerary not exists!' };
					res.send(json);
				} else {
					CRUISE_ITINERARIES_COLLECTION.update({ _id: new ObjectID(cruiseItineraryId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating cruise itinerary!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Cruise Itinerary updated successfully.', '_id': cruiseItineraryId };
							res.send(json);
						}
					});
				}
			});

		}
	}
}


/*
TODO: GET To get cruiseItinerery by Id.
*/
function _getCruiseItineraryById(req, res, next) {
	var cruiseItinerary = req.params.id;

	if (!COMMON_ROUTE.isValidId(cruiseItinerary)) {
		json.status = '0';
		json.result = { 'message': 'Invalid cruiseItinerary Id!' };
		res.send(json);
	} else {
		CRUISE_ITINERARIES_COLLECTION.findOne({ _id: new ObjectID(cruiseItinerary) }, function (cruiseItinerary, getCruiseItinerary) {
			if (cruiseItinerary || !getCruiseItinerary || getCruiseItinerary == null) {
				json.status = '0';
				json.result = { 'message': 'CruiseItinerary not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'CruiseItinerary found successfully.', 'cruiseitinerary': getCruiseItinerary };
				res.send(json);
			}
		});
	}
}
/*
TODO: POST To REMOVE CruiseItineraries by Id.
*/

function _removeCruiseItineraryById(req, res, next) {
	var cruiseItinerarie = req.params.id;

	if (!COMMON_ROUTE.isValidId(cruiseItinerarie)) {
		json.status = '0';
		json.result = { 'message': 'Invalid CruiseLine Id!' };
		res.send(json);
	} else {
		CRUISE_ITINERARIES_COLLECTION.find({ _id: new ObjectID(cruiseItinerarie) }, function (cruiselineerror, cruiseitineraries) {
			if (cruiselineerror || !cruiseitineraries) {
				json.status = '0';
				json.result = { 'message': 'CruiseItinerarie not exists!' };
				res.send(json);
			} else {
				CRUISE_ITINERARIES_COLLECTION.deleteOne({ _id: new ObjectID(cruiseItinerarie) }, function (error, result) {
					if (error) {
						json.status = '0';
						json.result = { 'error': 'Error in deleting CruiseItinerarie!' };
						res.send(json);
					} else {
						json.status = '1';
						json.result = { 'message': 'CruiseItinerarie deleted successfully.', '_id': cruiseItinerarie };
						res.send(json);
					}
				});
			}
		});
	}
}

function _checkItineraryByCruiseId(req,res,next)
{
	var cruiseLineId = req.params.id;
	if(!COMMON_ROUTE.isValidId(cruiseLineId)){
		json.status = '0';
		json.result = { 'message': 'Invalid cruiseLineId Id!' };
		res.send(json);
	}else{
		CRUISE_ITINERARIES_COLLECTION.findOne({ "cruise_line_id" : cruiseLineId },function(iterr, it) {
			if(iterr || !it)
			{
				json.status = '0';
				json.result = { 'message': 'Itinerary not exists!' };
				res.send(json);
			}
			else{
				json.status = '1';
				json.result = { 'message': 'Itinerary found successfully.', 'Itinerary': it };
				res.send(json);	
			}

		});
	}
}

/*
TODO: POST To get cruise itineraries.
*/
function _getAllCruiseItinerariesByTitle(req, res, next) {
	var query = {};
	var countQuery = {};
	var limit = (req.body.limit) ? req.body.limit : 10;
	var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;
	var titleQuery = {};
	var portQuery = {};
	var portsQuery = {};
	// var portIds = [];
	var portIds = req.body.portIds;

	var search = "";
	if (req.body.search) {
		search = Object.assign({}, req.body.search)
	}


	if (search) {
        if (search.subject) {
            query.title = { $regex: new RegExp(search.title, "i") };
        }
	}

	if (portIds && portIds.length > 0) {
        query.departure_port_id = { $in: portIds };
		// console.log('IF portIds ' + JSON.stringify(portIds));
    } else {
        query.departure_port_id = { $nin: portIds };
		// console.log('Else portIds ' + JSON.stringify(portIds));
    }

	var countQuery = query;

	CRUISE_ITINERARIES_COLLECTION.count(query, function (err, count) {
		totalRecords = count;
		CRUISE_ITINERARIES_COLLECTION.find(query, function (cruiselineerror, cruiseitineraries) {
			if (cruiselineerror || !cruiseitineraries) {
				json.status = '0';
				json.result = { 'message': 'Cruise Itineraries not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Cruise Itineraries found successfully.', 'cruiseitineraries': cruiseitineraries, 'totalRecords': totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});

	// if (search) {
		
	// 	portQuery = { 'name': new RegExp(search.departurePort, 'i') };
	// 	PORT_COLLECTION.find(portQuery, function (porterror, ports) {
	// 		async.forEach(ports, function (port, callback) {
	// 			portIds.push(port._id);
	// 			callback();
	// 		}, function (err) {
	// 			portsQuery = { departure_port_id: { $in: portIds } };

	// 			query = countQuery = Object.assign(portsQuery, titleQuery);


	// 			CRUISE_ITINERARIES_COLLECTION.count(countQuery, function (err, count) {
	// 				totalRecords = count;

	// 				CRUISE_ITINERARIES_COLLECTION.find(query, function (cruiselineerror, cruiseitineraries) {
	// 					if (cruiselineerror || !cruiseitineraries) {
	// 						json.status = '0';
	// 						json.result = { 'message': 'Cruise Itineraries not found!' };
	// 						res.send(json);
	// 					} else {
	// 						json.status = '1';
	// 						json.result = { 'message': 'Cruise Itineraries found successfully.', 'cruiseitineraries': cruiseitineraries, 'totalRecords': totalRecords };
	// 						res.send(json);
	// 					}
	// 				}).skip(skip).limit(limit);
	// 			});

	// 		});
	// 	});
	// } else {
	// 	CRUISE_ITINERARIES_COLLECTION.count(countQuery, function (err, count) {
	// 		totalRecords = count;

	// 		CRUISE_ITINERARIES_COLLECTION.find(query, function (cruiselineerror, cruiseitineraries) {
	// 			if (cruiselineerror || !cruiseitineraries) {
	// 				json.status = '0';
	// 				json.result = { 'message': 'Cruise Itineraries not found!' };
	// 				res.send(json);
	// 			} else {
	// 				json.status = '1';
	// 				json.result = { 'message': 'Cruise Itineraries found successfully.', 'cruiseitineraries': cruiseitineraries, 'totalRecords': totalRecords };
	// 				res.send(json);
	// 			}
	// 		}).skip(skip).limit(limit);
	// 	});

	// }
}




