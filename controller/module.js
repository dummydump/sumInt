var model = require('../models/model');
var MODULES_COLLECTION = model.modules;
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
exports.addModule = _addModule;
exports.getModuleById = _getModuleById;
exports.getModules = _getModules;
exports.updateModuleById = _updateModuleById;
exports.removeModuleById = _removeModuleById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new module.
*/
function _addModule(req, res, next) {
	var json = {};
	var moduleObject = {
		'name': req.body.name
	}

	if(COMMON_ROUTE.isUndefinedOrNull(moduleObject.name)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var module = new MODULES_COLLECTION(moduleObject);
		module.save(function (error, module) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new module!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New module added successfully.', '_id':module._id };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To Update Module By Id
*/
function _updateModuleById(req, res, next) {
	var moduleId = req.params.id;

	if(!COMMON_ROUTE.isValidId(moduleId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Module Id!' };
		res.send(json);
	} else {
		var moduleObject = {
			'name': req.body.name
		}

		if(COMMON_ROUTE.isUndefinedOrNull(moduleObject.name)) {
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: moduleObject
			};

			MODULES_COLLECTION.find({ _id: new ObjectID(moduleId)}, function (moduleerror, getModule) {
				if (moduleerror || !getModule) {
					json.status = '0';
					json.result = { 'message': 'Module not exists!' };
					res.send(json);
				} else {
					MODULES_COLLECTION.update({ _id: new ObjectID(moduleId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating module!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Module updated successfully.', '_id':moduleId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove Module By Id
*/
function _removeModuleById(req, res, next) {
	var moduleId = req.params.id;

	if(!COMMON_ROUTE.isValidId(moduleId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Module Id!' };
		res.send(json);
	} else { 
		MODULES_COLLECTION.find({ _id: new ObjectID(moduleId)}, function (moduleerror, getModule) {
            if (moduleerror || !getModule) {
                json.status = '0';
                json.result = { 'message': 'Module not exists!' };
                res.send(json);
            } else {
                MODULES_COLLECTION.deleteOne({ _id: new ObjectID(moduleId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting module!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Module deleted successfully.', '_id':moduleId };
                        res.send(json);
                    }
                });
            }
		});
	}
}

/*
TODO: GET To get module by Id.
*/
function _getModuleById(req, res, next) {
	var moduleId = req.params.id;

	if(!COMMON_ROUTE.isValidId(moduleId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Module Id!' };
		res.send(json);
	} else { 
		MODULES_COLLECTION.findOne({ _id: new ObjectID(moduleId)}, function (moduleerror, getModule) {
			if (moduleerror || getModule) {
				json.status = '0';
				json.result = { 'message': 'Module not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Module found successfully.', 'module': getModule };
				res.send(json);
			}
		});
	}
}


/*
TODO: POST To get modules.
*/
function _getModules(req, res, next) {
	var query = {};
	var countQuery = {};
	var limit = (req.body.limit)? req.body.limit : 10;
	var pageCount = (req.body.pageCount)? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;

	MODULES_COLLECTION.count(countQuery,function(err,count){
		totalRecords = count;

		MODULES_COLLECTION.find(query, function (moduleerror, modules) {
			if (moduleerror || !modules) {
				json.status = '0';
				json.result = { 'message': 'Modules not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Modules found successfully.', 'modules': modules, 'totalRecords':totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});
}