var model = require('../models/model');
var USERS_COLLECTION = model.users;
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
exports.getUserToken = _getUserToken;
exports.addUser = _addUser;
exports.getUserById = _getUserById;
exports.getUsers = _getUsers;
exports.updateUserById = _updateUserById;
exports.removeUserById = _removeUserById;
exports.getAgents = _getAgents;
exports.userLogin = _userLogin;
/*-------------------------------------------------------*/

/*
TODO: POST To signIn user.
*/
function _getUserToken(req, res, next) {
	var json = {};
	var email = req.body.email;
	var query = { "email": email };

	USERS_COLLECTION.findOne(query, function (usererror, getUser) {
		if (usererror || COMMON_ROUTE.isUndefinedOrNull(getUser)) {
			json.status = '0';
			json.result = { 'Message': 'You are not registered user' };
			res.send(json);
		} else {
			var token = jwt.sign(getUser, CONSTANT.superSecret, {
				expiresIn: 2592000 // expires in 30 days
			});
			json.status = '1';
			json.result = {"user": getUser, "token": 'Basic ' + token};
			res.send(json);
		}
	});
}

/*
TODO: POST To add new user.
*/
function _addUser(req, res, next) {
	var json = {};
	var userPhone1 = req.body.phone1;
	userPhone1 = userPhone1 != '' ? (userPhone1.match(/\d/g) != null ? userPhone1.match(/\d/g).join("") : '') : '';
	var userPhone2 = req.body.phone2;
	userPhone2 = userPhone2 != '' ? (userPhone2.match(/\d/g) != null ? userPhone2.match(/\d/g).join("") : '') : '';
	var userObject = {
		'email': req.body.email, 
		'roleName': req.body.roleName, 
		'assistantOf': req.body.assistantOf, 
		'gender': req.body.gender, 
		'firstName': req.body.firstName, 
		'lastName': req.body.lastName, 
		'phone1': userPhone1, 
		'phone2': userPhone2, 
		'address1': req.body.address1, 
		'address2': req.body.address2, 
		'city': req.body.city, 
		'state':req.body.state,
		'zipCode':req.body.zipCode,
		'country': req.body.country
	}
	var user = new USERS_COLLECTION(userObject);

	if(COMMON_ROUTE.isUndefinedOrNull(userObject.email) || COMMON_ROUTE.isUndefinedOrNull(userObject.firstName) || COMMON_ROUTE.isUndefinedOrNull(userObject.lastName)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		USERS_COLLECTION.find({email:req.body.email},function(err,userFound){
			if(err || userFound.length < 1){
				user.save(function (error, user) {
					if (error) {
						json.status = '0';
						json.result = { 'error': 'Error in adding new user!' };
						res.send(json);
					} else {
						json.status = '1';
						json.result = { 'message': 'New user added successfully.', '_id':user._id };
						res.send(json);
					}
				});
			} else {
				json.status = '0';
				json.result = { 'error': 'Email Id already exists!' };
				res.send(json);
			}
		});
		
	}
}

/*
TODO: POST To Update User By Id
*/
function _updateUserById(req, res, next) {
	var userId = req.params.id;

	if(!COMMON_ROUTE.isValidId(userId)){
		json.status = '0';
		json.result = { 'message': 'Invalid User Id!' };
		res.send(json);
	} else {
		var userPhone1 = req.body.phone1;
		userPhone1 = userPhone1 != '' ? (userPhone1.match(/\d/g) != null ? userPhone1.match(/\d/g).join("") : '') : '';
		var userPhone2 = req.body.phone2;
		userPhone2 = userPhone2 != '' ? (userPhone2.match(/\d/g) != null ? userPhone2.match(/\d/g).join("") : '') : '';
		var userObject = {
            'email': req.body.email, 
            'roleName': req.body.roleName, 
            'assistantOf': req.body.assistantOf, 
            'gender': req.body.gender, 
            'firstName': req.body.firstName, 
            'lastName': req.body.lastName, 
            'phone1': userPhone1, 
            'phone2': userPhone2, 
            'address1': req.body.address1, 
            'address2': req.body.address2, 
			'city': req.body.city, 
			'state':req.body.state,
	     	'zipCode':req.body.zipCode,
            'country': req.body.country, 
        }

		if(COMMON_ROUTE.isUndefinedOrNull(userObject.email) || COMMON_ROUTE.isUndefinedOrNull(userObject.firstName) || COMMON_ROUTE.isUndefinedOrNull(userObject.lastName) || COMMON_ROUTE.isUndefinedOrNull(userId)){
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: userObject
			};

			USERS_COLLECTION.find({ _id: new ObjectID(userId)}, function (usererror, getUser) {
				if (usererror || !getUser) {
					json.status = '0';
					json.result = { 'message': 'User not exists!' };
					res.send(json);
				} else {
					USERS_COLLECTION.update({ _id: new ObjectID(userId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating user!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'User updated successfully.', '_id':userId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove User By Id
*/
function _removeUserById(req, res, next) {
	var userId = req.params.id;

	if(!COMMON_ROUTE.isValidId(userId)){
		json.status = '0';
		json.result = { 'message': 'Invalid User Id!' };
		res.send(json);
	} else { 
		USERS_COLLECTION.find({ _id: new ObjectID(userId)}, function (usererror, getUser) {
            if (usererror || !getUser) {
                json.status = '0';
                json.result = { 'message': 'User not exists!' };
                res.send(json);
            } else {
                USERS_COLLECTION.deleteOne({ _id: new ObjectID(userId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting user!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'User deleted successfully.','_id':userId };
                        res.send(json);
                    }
                });
            }
		});
	}
}

/*
TODO: GET To get user by Id.
*/
function _getUserById(req, res, next) {
	var userId = req.params.id;

	if(!COMMON_ROUTE.isValidId(userId)){
		json.status = '0';
		json.result = { 'message': 'Invalid User Id!' };
		res.send(json);
	} else { 
		USERS_COLLECTION.findOne({ _id: new ObjectID(userId)}, function (usererror, getUser) {
			if (usererror || !getUser) {
				json.status = '0';
				json.result = { 'message': 'User not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'User found successfully.', 'user': getUser };
				res.send(json);
			}
		});
	}
}


/*
TODO: POST To get users.
*/
function _getUsers(req, res, next) {
	var limit = (req.body.limit)? req.body.limit : 10;
	var pageCount = (req.body.pageCount)? req.body.pageCount : 0;
	var skip = (limit * pageCount);
//	var searchBy = (req.body.searchBy)? req.body.searchBy : '';
//	var searchValue = (req.body.searchBy)? req.body.searchValue : '';
	var totalRecords = 0;
	var query = {};
	var countQuery = {};
	var firstNameQuery = {};
	var lastNameQuery = {};
	var emailQuery = {};
	var telephoneQuery = {};
	var roleQuery = {};
	var addressQuery = {};
	var search = {};
	var address1Query = {};
	var address2Query = {};

	if(req.body.search){
		search = Object.assign({},req.body.search);
	}

	if(search){
		if(search.firstName){
			firstNameQuery  = {firstName: {$regex: new RegExp("^" + search.firstName.toLowerCase(), "i")}};
		} if(search.lastName){
			lastNameQuery  = {lastName: {$regex: new RegExp("^" + search.lastName.toLowerCase(), "i")}};
		} if(search.address){
			address1Query  = {$or: [{address1: {$regex: new RegExp("^" + search.address.toLowerCase(), "i")}}, {address2: {$regex: new RegExp("^" + search.address.toLowerCase(), "i")}}]};
		} if(search.telephone){
			telephoneQuery  = {$or: [{phone1: {$regex: new RegExp("^" + search.telephone.toLowerCase(), "i")}}, {phone2: {$regex: new RegExp("^" + search.telephone.toLowerCase(), "i")}}]};
		} if(search.email){
			emailQuery= {email: {$regex: new RegExp("^" + search.email.toLowerCase(), "i")}};
		} if(search.role){
			roleQuery = {roleName: {$regex: new RegExp("^" + search.role.toLowerCase(), "i")}};
		} 
	}

	// if(search && search.role){
	// 	var roleQ = {name: {$regex: new RegExp("^" + search.role.toLowerCase(), "i")}};

	// 	ROLES_COLLECTION.find(roleQ, {_id:1, name:1}, function (roleErr, roles) {
	// 		if (roleErr || !roles || roles.length <= 0) {
	// 			json.status = '0';
	// 			json.result = { 'message': 'Users not found!' };
	// 			res.send(json);
	// 		} else {
	// 			// var roleIds = roles.map(a => a._id);
	// 			// roleQuery  = {roleId: { $in: roleIds}};

	// 			roleQuery = {name: {$regex: new RegExp("^" + search.roleName.toLowerCase(), "i")}};

	// 			var query = countQuery =  Object.assign({}, firstNameQuery, emailQuery, telephoneQuery, lastNameQuery, address1Query,roleQuery);

	// 			getUserListCommon(query, countQuery, skip, limit, function(usererror, users, totalRecords){
	// 				if (usererror || !users) {
	// 					json.status = '0';
	// 					json.result = { 'message': 'Users not found!' };
	// 					res.send(json);
	// 				} else {
	// 					json.status = '1';
	// 					json.result = { 'message': 'Users found successfully.', 'users': users, 'totalRecords':totalRecords};
	// 					res.send(json);
	// 				}
	// 			});
	// 		}
	// 	});

	// } else {
		var query = countQuery =  Object.assign({},firstNameQuery,emailQuery,telephoneQuery,lastNameQuery,address1Query,roleQuery);
		getUserListCommon(query, countQuery, skip, limit, function(usererror, users, totalRecords){
			if (usererror || !users) {
				json.status = '0';
				json.result = { 'message': 'Users not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Users found successfully.', 'users': users, 'totalRecords':totalRecords};
				res.send(json);
			}
		});
	// }
}

function getUserListCommon(query, countQuery, skip, limit, callback){
	var totalRecords = 0;
	USERS_COLLECTION.count(countQuery,function(err,count){
		totalRecords = count;
		USERS_COLLECTION.find(query, function (usererror, users) {
			if (usererror || !users) {
				callback(usererror);
			} else {
				callback(null, users, totalRecords);
			}
		}).skip(skip).limit(limit);
	});
}

//For getting the agents
function _getAgents(req,res,next){
	var query={
		// "roleName":"Agent"
	};
	USERS_COLLECTION.find(query,{firstName:1,lastName:1,email:1,roleName:1}, function (usererror, users) {
		if (usererror || !users) {
			json.status = '0';
			json.result = { 'message': 'Users not found!' };
			res.send(json);
		} else {
			json.status = '1';
			json.result = { 'message': 'Users found successfully.', 'users': users};
			res.send(json);
		}
	})
}

/*
TODO: POST To user Login.
*/
function _userLogin(req, res, next) {
	var json = {};
	var email = req.body.email;
	var password = req.body.password;
	if (COMMON_ROUTE.isUndefinedOrNull(email) || COMMON_ROUTE.isUndefinedOrNull(password)) {
		json.status = '0';
		json.result = { 'Message': 'Email/Password is missing' };
		res.send(json);
	} else {
		var query = { "email": email };
		console.log('test ' + JSON.stringify(query));
		USERS_COLLECTION.findOne(query, function (usererror, getUser) {
			console.log(' getUser ' + JSON.stringify(getUser));
			if (usererror || COMMON_ROUTE.isUndefinedOrNull(getUser)) {
				json.status = '0';
				json.result = { 'Message': 'You are not registered user' };
				res.send(json);
			} else {
				if (getUser.password == password) {
					json.status = '1';
					json.result = { "Message": "Login Successfully", "user": getUser };
					res.send(json);
				} else {
					json.status = '0';
					json.result = { "Message": "Password is worng" };
					res.send(json);
				}
			}
		});
	} 
}