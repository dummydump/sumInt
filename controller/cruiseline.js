

var model = require('../models/model');
var CHECKS_COLLECTION = model.checks;
var CRUISE_LINES_COLLECTION = model.cruise_lines;
var CRUISE_ITINERARIES_COLLECTION = model.cruise_itineraries;
var PORT_COLLECTION = model.ports;
var SHIP_COLLECTION = model.ships;
var SUPPLIERS_COLLECTION = model.suppliers;
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

/*-------------------------------------------------------*/
exports.addCruiseLine = _addCruiseLine;
exports.getCruiseLineById = _getCruiseLineById;
exports.getCruiseLines = _getCruiseLines;
exports.updateCruiseLineById = _updateCruiseLineById;
exports.removeCruiseLineById = _removeCruiseLineById;
exports.getAllCruiseLinesByTitle = _getAllCruiseLinesByTitle;
exports.listCruiseLinesByIds = _listCruiseLinesByIds
/*-------------------------------------------------------*/

/*
TODO: POST To add new cruiseline.
*/
function _addCruiseLine(req, res, next) {
	var json = {};
	var cruiselineObject = {
		'name': req.body.name,
		'ships': req.body.ships
	}

	if (COMMON_ROUTE.isUndefinedOrNull(cruiselineObject.name)) {
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var cruiseline = new CRUISE_LINES_COLLECTION(cruiselineObject);

		cruiseline.save(function (error, cruiseline) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new Cruise Line!' };
				res.send(json);
			} else {
				supplierObject = {
					'name' : cruiseline.name,
					'foreignId' : cruiseline._id
				}
				var supplier = new SUPPLIERS_COLLECTION(supplierObject);

				supplier.save(function(err,supplier){
					if(err)
					{
						CRUISE_LINES_COLLECTION.deleteOne({ _id: new ObjectID(cruiseline._id) });	
						json.status = '0';
						json.result = { 'error': 'Error in adding new Cruise Line!' };
						res.send(json);	
					}
					else
					{
						json.status = '1';
						json.result = { 'message': 'New Cruise Line added successfully.', '_id': cruiseline._id,'suppliersId':supplier._id };
						res.send(json);
					}
				});
				
			}
		});
	}
}

/*
TODO: POST To Update CruiseLine By Id
*/
function _updateCruiseLineById(req, res, next) {
	var cruiselineId = req.params.id;

	if (!COMMON_ROUTE.isValidId(cruiselineId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Cruise Line Id!' };
		res.send(json);
	} else {
		var cruiselineObject = {
			'name': req.body.name,
			'ships': req.body.ships
		}

		if (COMMON_ROUTE.isUndefinedOrNull(cruiselineObject.name)) {
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: cruiselineObject
			};

			CRUISE_LINES_COLLECTION.find({ _id: new ObjectID(cruiselineId) }, function (cruiselineerror, getCruiseLine) {
				if (cruiselineerror || !getCruiseLine) {
					json.status = '0';
					json.result = { 'message': 'Cruise Line not exists!' };
					res.send(json);
				} else {

					CRUISE_LINES_COLLECTION.update({ _id: new ObjectID(cruiselineId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating cruiseline!' };
							res.send(json);
						} else {
							supplierObject = {
								'name' : cruiselineObject.name,
								'foreignId' : cruiselineId
							}
							var query = {
								$set : supplierObject
							}
							SUPPLIERS_COLLECTION.update({foreignId : cruiselineId },query, function(err,supplierUpd){
								if(err)
								{
									json.status = '0';
									json.result = { 'error': 'Error in updating cruiseline!' };
									res.send(json);
								}
								else
								{
									json.status = '1';
									json.result = { 'message': 'Cruise Line updated successfully.', '_id': cruiselineId };
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
TODO: POST To Remove CruiseLine By Id
*/
function _removeCruiseLineById(req, res, next) {
	var cruiselineId = req.params.id;

	if (!COMMON_ROUTE.isValidId(cruiselineId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid CruiseLine Id!' };
		res.send(json);
	} else {
		CRUISE_LINES_COLLECTION.find({ _id: new ObjectID(cruiselineId) }, function (cruiselineerror, getCruiseLine) {
			if (cruiselineerror || !getCruiseLine) {
				json.status = '0';
				json.result = { 'message': 'Cruise Line not exists!' };
				res.send(json);
			} else {
				SUPPLIERS_COLLECTION.findOne({foreignId : cruiselineId},function(err,supplier){
					if(err || !supplier)
					{
						CRUISE_LINES_COLLECTION.deleteOne({ _id: new ObjectID(cruiselineId) }, function (error, result) {
							
							if (error) {
								json.status = '0';
								json.result = { 'error': 'Error in deleting Cruise Line!' };
								res.send(json);
							} else {
								json.status = '1';
								json.result = { 'message': 'Cruise Line deleted successfully.', '_id': cruiselineId };
								res.send(json);
							}
						});
					}
					else
					{
						CHECKS_COLLECTION.findOne({senderId : supplier._id},function(checkerr,check){
							if(checkerr || !check)
							{
								
								CRUISE_LINES_COLLECTION.deleteOne({ _id: new ObjectID(cruiselineId) }, function (error, result) {
									

									if (error) {
										json.status = '0';
										json.result = { 'error': 'Error in deleting Cruise Line!' };
										res.send(json);
									} else {
										json.status = '1';
										json.result = { 'message': 'Cruise Line deleted successfully.', '_id': cruiselineId };
										res.send(json);
									}
								});

							}
							else
							{
								
								json.status = '0';
								json.result = { 'error': 'Check with this Cruise Line exists!' };
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
TODO: GET To get cruiseline by Id.
*/
function _getCruiseLineById(req, res, next) {
	var cruiselineId = req.params.id;

	if (!COMMON_ROUTE.isValidId(cruiselineId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid CruiseLine Id!' };
		res.send(json);
	} else {
		CRUISE_LINES_COLLECTION.findOne({ _id: new ObjectID(cruiselineId) }, function (cruiselineerror, getCruiseLine) {
			if (cruiselineerror || !getCruiseLine || getCruiseLine == null) {
				json.status = '0';
				json.result = { 'message': 'Cruise Line not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Cruise Line found successfully.', 'cruiseline': getCruiseLine };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get cruiselines.
*/
function _getCruiseLines(req, res, next) {
	var query = {};
	var countQuery = {};
	var limit = (req.body.limit) ? req.body.limit : 10;
	var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;
	var nameQuery = {};
	var search = {};

	if (req.body.search) {
		search = Object.assign({}, req.body.search)
	}

	if (search) {
		if (search.name) {
			nameQuery = { 'name': new RegExp(search.name, 'i') };
		}
	}

	var query = countQuery = Object.assign({}, nameQuery);

	CRUISE_LINES_COLLECTION.count(countQuery, function (err, count) {
		totalRecords = count;

		CRUISE_LINES_COLLECTION.find(query, function (cruiselineerror, cruiselines) {
			if (cruiselineerror || !cruiselines) {
				json.status = '0';
				json.result = { 'message': 'Cruise Lines not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Cruise Lines found successfully.', 'cruiselines': cruiselines, 'totalRecords': totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});

}

/*
TODO: POST To get cruise lines.
*/
function _getAllCruiseLinesByTitle(req, res, next) {
	var query = {};
	var countQuery = {};
	var limit = (req.body.limit) ? req.body.limit : 10;
	var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;
	var titleQuery = {};
	var portQuery = {};
	var portsQuery = {};
	var portIds = [];

	var search = "";
	if (req.body.search) {
		search = Object.assign({}, req.body.search)
	}

	if (search) {
		if (search.title) {
			titleQuery = { title: { $regex: new RegExp(search.title.toLowerCase(), "i") } };
			query = countQuery = Object.assign({}, titleQuery);

			CRUISE_ITINERARIES_COLLECTION.count(countQuery, function (err, count) {
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
		} else if (search.departurePort) {

			portQuery = { 'name': new RegExp(search.departurePort, 'i') };
			PORT_COLLECTION.find(portQuery, function (porterror, ports) {
				async.forEach(ports, function (port, callback) {
					portIds.push(port._id);
					callback();
				}, function (err) {
					portsQuery = { departure_port_id: { $in: portIds } };
					query = Object.assign(portsQuery, titleQuery);
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
				});
			});

		} else {
			CRUISE_ITINERARIES_COLLECTION.count({}, function (err, count) {
				totalRecords = count;

				CRUISE_ITINERARIES_COLLECTION.find({}, function (cruiselineerror, cruiseitineraries) {
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

		}

	} else {
		CRUISE_ITINERARIES_COLLECTION.count({}, function (err, count) {
			totalRecords = count;

			CRUISE_ITINERARIES_COLLECTION.find({}, function (cruiselineerror, cruiseitineraries) {
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
	}
}



/*
TODO: POST To List CruiseLines By Ids.
*/
function _listCruiseLinesByIds(req, res, next) {

	var ids = req.body;
	var obj_ids = ids.map(function (id) { return ObjectID(id); });
	var query = { _id: { $in: obj_ids } };

	CRUISE_LINES_COLLECTION.find({}, { name: 1 }, function (cruiseLineserror, cruiseLines) {

		if (cruiseLineserror || !cruiseLines) {
			json.status = '0';
			json.result = { 'message': 'Cruise Lines not found!' };
			res.send(json);
		} else {

			json.status = '1';
			json.result = { 'message': 'Cruise Lines found successfully.', 'cruiseLines': cruiseLines, 'totalRecords': cruiseLines.length };
			res.send(json);
		}
	});
}

