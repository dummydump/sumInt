var model = require('../models/model');
var TOUR_OPERATORS = model.tour_operators;
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
exports.addTourOperator = _addTourOperator;
exports.getTourOperatorById = _getTourOperatorById;
exports.getTourOperators = _getTourOperators;
exports.updateTourOperatorById = _updateTourOperatorById;
exports.removeTourOperatorById = _removeTourOperatorById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new tourOperator.
*/
function _addTourOperator(req, res, next) {
	var json = {};
	var tourOperatorObject = {
		'name': req.body.name, 
		'telephone': req.body.telephone, 
		'email': req.body.email,
		'website': req.body.website,
		'owner': req.body.owner
	}

	if(COMMON_ROUTE.isUndefinedOrNull(tourOperatorObject.name)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var tourOperator = new TOUR_OPERATORS(tourOperatorObject);

		tourOperator.save(function (error, tourOperator) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new tourOperator!' };
				res.send(json);
			} else {

				supplierObject = {
					'name' : tourOperator.name,
					'foreignId' : tourOperator._id
				}
				var supplier = new SUPPLIERS_COLLECTION(supplierObject);

				supplier.save(function(err,supplier){
					if(err)
					{
						
						TOUR_OPERATORS.deleteOne({ _id: new ObjectID(tourOperator._id) });	
						json.status = '0';
						json.result = { 'error': 'Error in adding new Tour Operator!' };
						res.send(json);	
					}
					else
					{
						json.status = '1';
						json.result = { 'message': 'New Tour Operator added successfully.', '_id': tourOperator._id,'suppliersId':supplier._id };
						res.send(json);
					}
				});

			}
		});
	}
}

/*
TODO: POST To Update TourOperator By Id
*/
function _updateTourOperatorById(req, res, next) {
	var tourOperatorId = req.params.id;

	if(!COMMON_ROUTE.isValidId(tourOperatorId)){
		json.status = '0';
		json.result = { 'message': 'Invalid TourOperator Id!' };
		res.send(json);
	} else {
		var tourOperatorObject = {
            'name': req.body.name, 
            'telephone': req.body.telephone, 
            'email': req.body.email,
            'website': req.body.website,
            'owner': req.body.owner
        }

        if(COMMON_ROUTE.isUndefinedOrNull(tourOperatorObject.name)){
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: tourOperatorObject
			};

			TOUR_OPERATORS.findOne({ _id: new ObjectID(tourOperatorId)}, function (tourOperatorError, getTourOperator) {
				if (tourOperatorError || !getTourOperator) {
					json.status = '0';
					json.result = { 'message': 'Tour Operator not exists!' };
					res.send(json);
				} else {
					TOUR_OPERATORS.update({ _id: new ObjectID(tourOperatorId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating tourOperator!' };
							res.send(json);
						} else {

							supplierObject = {
								'name' : tourOperatorObject.name,
								'foreignId' : tourOperatorId
							}
							var query = {
								$set : supplierObject
							}
							SUPPLIERS_COLLECTION.update({foreignId : tourOperatorId },query, function(err,supplierUpd){
								if(err)
								{
									json.status = '0';
									json.result = { 'error': 'Error in updating Tour Operator!' };
									res.send(json);
								}
								else
								{
									json.status = '1';
									json.result = { 'message': 'Tour Operator updated successfully.', '_id': tourOperatorId };
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
TODO: POST To Remove TourOperator By Id
*/
function _removeTourOperatorById(req, res, next) {
	var tourOperatorId = req.params.id;

	if(!COMMON_ROUTE.isValidId(tourOperatorId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Tour Operator Id!' };
		res.send(json);
	} else { 
		TOUR_OPERATORS.findOne({ _id: new ObjectID(tourOperatorId)}, function (tourOperatorError, getTourOperator) {
            if (tourOperatorError || !getTourOperator) {
                json.status = '0';
                json.result = { 'message': 'Tour Operator not exists!' };
                res.send(json);
            } else {

				SUPPLIERS_COLLECTION.findOne({foreignId : tourOperatorId},function(err,supplier){
					if(err || !supplier)
					{
						
						TOUR_OPERATORS.deleteOne({ _id: new ObjectID(tourOperatorId) }, function (error, result) {
							if (error) {
								json.status = '0';
								json.result = { 'error': 'Error in deleting tourOperator!' };
								res.send(json);
							} else {
								json.status = '1';
								json.result = { 'message': 'Tour Operator deleted successfully.', '_id':tourOperatorId };
								res.send(json);
							}
						});
					}
					else
					{
						CHECKS_COLLECTION.findOne({senderId : supplier._id},function(checkerr,check){
							if(checkerr || !check)
							{
								TOUR_OPERATORS.deleteOne({ _id: new ObjectID(tourOperatorId) }, function (error, result) {
									if (error) {
										json.status = '0';
										json.result = { 'error': 'Error in deleting tourOperator!' };
										res.send(json);
									} else {
										json.status = '1';
										json.result = { 'message': 'Tour Operator deleted successfully.', '_id':tourOperatorId };
										res.send(json);
									}
								});

							}
							else
							{
								
								json.status = '0';
								json.result = { 'error': 'Check with this Tour Operator exists!' };
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
TODO: GET To get tourOperator by Id.
*/
function _getTourOperatorById(req, res, next) {
	var tourOperatorId = req.params.id;

	if(!COMMON_ROUTE.isValidId(tourOperatorId)){
		json.status = '0';
		json.result = { 'message': 'Invalid TourOperator Id!' };
		res.send(json);
	} else { 
		TOUR_OPERATORS.findOne({ _id: new ObjectID(tourOperatorId)}, function (tourOperatorError, getTourOperator) {
			if (tourOperatorError || !getTourOperator) {
				json.status = '0';
				json.result = { 'message': 'Tour Operator not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Tour Operator found successfully.', 'tourOperator': getTourOperator };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get tour_operators.
*/
function _getTourOperators(req, res, next) {
	var query = {};
	var countQuery  = {};
	var limit = (req.body.limit)? req.body.limit : 10;
	var pageCount = (req.body.pageCount)? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;
	var nameQuery ={};
	var search = "";

	if (req.body.search) {
        search = Object.assign({}, req.body.search)
    }

	if (search) {
        if (search.companyName) {
            nameQuery = {  'name': new RegExp(search.companyName, 'i') };
		}
	}
		var query = countQuery = Object.assign({},nameQuery);

	TOUR_OPERATORS.count(countQuery,function(err,count){
		totalRecords = count;
	
		TOUR_OPERATORS.find(query, function (tourOperatorError, tour_operators) {
			if (tourOperatorError || !tour_operators) {
				json.status = '0';
				json.result = { 'message': 'Tour Operator not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Tour Operator found successfully.', 'tour_operators': tour_operators, 'totalRecords': totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});
}