var model = require('../models/model');
var ROLES_COLLECTION = model.roles;
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
exports.addRole = _addRole;
exports.getRoleById = _getRoleById;
exports.getRoles = _getRoles;
exports.updateRoleById = _updateRoleById;
exports.removeRoleById = _removeRoleById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new role.
*/
function _addRole(req, res, next) {
	var json = {};
	var roleObject = {
		'name': req.body.name, 
		'access': req.body.access
	}

	if(COMMON_ROUTE.isUndefinedOrNull(roleObject.name)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var role = new ROLES_COLLECTION(roleObject);
		role.save(function (error, role) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new role!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New role added successfully.', '_id': role._id };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To Update Role By Id
*/
function _updateRoleById(req, res, next) {
	var roleName = req.params.roleName;

	if(!COMMON_ROUTE.isValidId(roleName)){
		json.status = '0';
		json.result = { 'message': 'Invalid Role Id!' };
		res.send(json);
	} else {
		var roleObject = {
			'name': req.body.name, 
			'access': req.body.access
		}

		if(COMMON_ROUTE.isUndefinedOrNull(roleObject.name)) {
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: roleObject
			};

			ROLES_COLLECTION.find({ name: roleName}, function (roleerror, getRole) {
				if (roleerror || !getRole) {
					json.status = '0';
					json.result = { 'message': 'Role not exists!' };
					res.send(json);
				} else {
					ROLES_COLLECTION.update({ name: roleName }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating role!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Role updated successfully.', '_id':roleName };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove Role By Id
*/
function _removeRoleById(req, res, next) {
	var roleName = req.params.roleName;

	// if(!COMMON_ROUTE.isValidId(roleId)){
	// 	json.status = '0';
	// 	json.result = { 'message': 'Invalid Role Id!' };
	// 	res.send(json);
	// } else { 
		ROLES_COLLECTION.find({ name: roleName}, function (roleerror, getRole) {
            if (roleerror || !getRole) {
                json.status = '0';
                json.result = { 'message': 'Role not exists!' };
                res.send(json);
            } else {
                ROLES_COLLECTION.deleteOne({ name: roleName }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting role!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Role deleted successfully.', '_id': roleName };
                        res.send(json);
                    }
                });
            }
		});
	// }
}

/*
TODO: GET To get role by Id.
*/
function _getRoleById(req, res, next) {
	var roleId = req.params.roleName;

	if(!COMMON_ROUTE.isValidId(roleId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Role Id!' };
		res.send(json);
	} else { 
		ROLES_COLLECTION.findOne({ _id: new ObjectID(roleId)}, function (roleerror, getRole) {
			if (roleerror || !getRole) {
				json.status = '0';
				json.result = { 'message': 'Role not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Role found successfully.', 'role': getRole };
				res.send(json);
			}
		});
	}
}


/*
TODO: POST To get roles.
*/
function _getRoles(req, res, next) {
	var query = {};
	var countQuery = {};
	var limit = (req.body.limit)? req.body.limit : 10;
	var pageCount = (req.body.pageCount)? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;

	ROLES_COLLECTION.count(countQuery,function(err,count){
		totalRecords = count;
		
		ROLES_COLLECTION.find(query, function (roleerror, roles) {
			if (roleerror || !roles) {
				json.status = '0';
				json.result = { 'message': 'Roles not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Roles found successfully.', 'roles': roles, 'totalRecords':totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});
}