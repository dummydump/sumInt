var model = require('../models/model');
var RELATIVES_COLLECTION = model.relatives;
var CLIENTS_COLLECTION = model.clients;
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
exports.addRelative = _addRelative;
exports.updateRelativeById = _updateRelativeById;
exports.removeRelativeById = _removeRelativeById;
exports.getRelatives = _getRelatives;
exports.getRelativesByClientId = _getRelativesByClientId;
/*-------------------------------------------------------*/

/*
TODO: POST To add realtive.
*/
function _addRelative(req, res, next) {
	var json = {};
	var relativeObjectFirst = {
		'clientId': req.body.clientId, 
		'relativeClientId': req.body.relativeClientId,
		'relation': req.body.relation
	};

	if(!COMMON_ROUTE.isValidId(relativeObjectFirst.clientId) || !COMMON_ROUTE.isValidId(relativeObjectFirst.relativeClientId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid ClientId Or RelativeClientId!' };
		res.send(json);
	} else if(relativeObjectFirst.clientId == relativeObjectFirst.relativeClientId){
		json.status = '0';
		json.result = { 'message': 'ClientId and RelateId can not be same!' };
		res.send(json);
	} else {
		var relative1 = new RELATIVES_COLLECTION(relativeObjectFirst);
        CLIENTS_COLLECTION.findOne({_id: new ObjectID(relativeObjectFirst.clientId)}, function (clienterror, getClient) {
            if (clienterror || !getClient || getClient.length <= 0) {
                json.status = '0';
                json.result = { 'message': 'Client not exists!' };
                res.send(json);
            } else {
                CLIENTS_COLLECTION.findOne({_id: new ObjectID(req.body.relativeClientId)}, function (relativeerror, getRelative) {
                    if (relativeerror || !getRelative || getRelative.length <= 0) {
                        json.status = '0';
                        json.result = { 'message': 'Relative not exists!' };
                        res.send(json);
                    } else {
                        RELATIVES_COLLECTION.findOne({clientId: req.body.clientId, relativeClientId: req.body.relativeClientId, relation: req.body.relation}, function (relationerror, getRelation) {
                           if (relationerror) {
                                json.status = '0';
                                json.result = { 'message': 'Error while getting relation!' };
                                res.send(json);
                            } else if (!relativeerror && getRelation) {
                                json.status = '0';
                                json.result = { 'message': 'Relation already added for this Client!' };
                                res.send(json);
                            } else { 
                                relative1.save(function (error, client1) {
                                    if (error) {
                                        json.status = '0';
                                        json.result = { 'error': 'Error in adding new relative!' };
                                        res.send(json);
                                    } else {
                                        var relativeObjectTwo = {
                                            'clientId': req.body.relativeClientId, 
                                            'relativeClientId': req.body.clientId,
                                            'relation': COMMON_ROUTE.getRelation(req.body.relation, getClient.gender)
                                        }
                                        var relative2 = new RELATIVES_COLLECTION(relativeObjectTwo);
                                        relative2.save(function (error, client2) {
                                            if (error) {
                                                json.status = '0';
                                                json.result = { 'error': 'Error in adding new relative!' };
                                                res.send(json);
                                            } else {
                                                json.status = '1';
                                                json.result = { 'message': 'New relative added successfully.', '_id':client2._id };
                                                res.send(json);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
		});
	}
}


/*
TODO: POST To Update Relative By Id
*/
/*
function _updateRelativeById(req, res, next) {
	var relativeId = req.params.id;

    var relativeObjectFirst = {
		'clientId': req.body.clientId, 
		'relativeClientId': req.body.relativeClientId,
		'relation': req.body.relation
	}

	if(!COMMON_ROUTE.isValidId(relativeObjectFirst.clientId) || !COMMON_ROUTE.isValidId(relativeObjectFirst.relativeClientId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid ClientId Or RelativeClientId!' };
		res.send(json);
	} else if(relativeObjectFirst.clientId == relativeObjectFirst.relativeClientId){
		json.status = '0';
		json.result = { 'message': 'ClientId and RelateId can not be same!' };
		res.send(json);
	}  else {
		CLIENTS_COLLECTION.findOne({_id: new ObjectID(relativeObjectFirst.clientId)}, function (clienterror, getClient) {
            if (clienterror || !getClient || getClient.length <= 0) {
                json.status = '0';
                json.result = { 'message': 'Client not exists!' };
                res.send(json);
            } else if(COMMON_ROUTE.getRelation(req.body.relation, getClient.gender) == ''){
                json.status = '0';
                json.result = { 'message': 'Invalid Relation Name!' };
                res.send(json);
            } else {
                CLIENTS_COLLECTION.findOne({_id: new ObjectID(req.body.relativeClientId)}, function (relativeerror, getRelative) {
                    if (relativeerror || !getRelative || getRelative.length <= 0) {
                        json.status = '0';
                        json.result = { 'message': 'Relative not exists!' };
                        res.send(json);
                    } else {
                        RELATIVES_COLLECTION.findOne({clientId: req.body.clientId, relativeClientId: req.body.relativeClientId}, function (relationerror, getRelation) {
                           if (relationerror) {
                                json.status = '0';
                                json.result = { 'message': 'Error while getting relation!' };
                                res.send(json);
                            } else if (!relativeerror && !getRelation) {
                                json.status = '0';
                                json.result = { 'message': 'Relation not found!' };
                                res.send(json);
                            } else { 
                                var query1 = {"clientId": getRelation.clientId, "relativeClientId": getRelation.relativeClientId};
                                var query2 = {"clientId": getRelation.relativeClientId, "relativeClientId": getRelation.clientId};
                                RELATIVES_COLLECTION.remove({ $or:[query1, query2] }, function (error, result) {
                                    if (error) {
                                        json.status = '0';
                                        json.result = { 'error': 'Error in deleting relative!' };
                                        res.send(json);
                                    } else {
                                        var relative1 = new RELATIVES_COLLECTION(relativeObjectFirst);
                                        relative1.save(function (error, client1) {
                                            if (error) {
                                                json.status = '0';
                                                json.result = { 'error': 'Error in updating relative 1 !' };
                                                res.send(json);
                                            } else {
                                                var relativeObjectTwo = {
                                                    'clientId': req.body.relativeClientId, 
                                                    'relativeClientId': req.body.clientId,
                                                    'relation': COMMON_ROUTE.getRelation(req.body.relation, getClient.gender)
                                                }
                                                var relative2 = new RELATIVES_COLLECTION(relativeObjectTwo);
                                                relative2.save(function (error, client2) {
                                                    if (error) {
                                                        json.status = '0';
                                                        json.result = { 'error': 'Error in updating relative 2 !' };
                                                        res.send(json);
                                                    } else {
                                                        json.status = '1';
                                                        json.result = { 'message': 'Relative updated successfully.', '_id':relativeId };
                                                        res.send(json);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
		});
	}
}
*/
function _updateRelativeById(req, res, next) {
	var relativeId = req.params.id;

    var relativeObjectFirst = {
		'clientId': req.body.clientId, 
		'relativeClientId': req.body.relativeClientId,
		'relation': req.body.relation
    }

	if(!COMMON_ROUTE.isValidId(relativeObjectFirst.clientId) || !COMMON_ROUTE.isValidId(relativeObjectFirst.relativeClientId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid ClientId Or RelativeClientId!' };
		res.send(json);
	} else if(relativeObjectFirst.clientId == relativeObjectFirst.relativeClientId){
		json.status = '0';
		json.result = { 'message': 'ClientId and RelateId can not be same!' };
		res.send(json);
	}  else {
		CLIENTS_COLLECTION.findOne({_id: new ObjectID(relativeObjectFirst.clientId)}, function (clienterror, getClient) {
            if (clienterror || !getClient || getClient.length <= 0) {
                json.status = '0';
                json.result = { 'message': 'Client not exists!' };
                res.send(json);
            } else if(COMMON_ROUTE.getRelation(req.body.relation, getClient.gender) == ''){
                json.status = '0';
                json.result = { 'message': 'Invalid Relation Name!' };
                res.send(json);
            } else {
                CLIENTS_COLLECTION.findOne({_id: new ObjectID(req.body.relativeClientId)}, function (relativeerror, getRelative) {
                    if (relativeerror || !getRelative || getRelative.length <= 0) {
                        json.status = '0';
                        json.result = { 'message': 'Relative not exists!' };
                        res.send(json);
                    } else {
                        RELATIVES_COLLECTION.findOne({_id:new ObjectID(req.body.relativeId)}, function (relationerror, getRelation) {
                           if (relationerror && !getRelation) {
                                json.status = '0';
                                json.result = { 'message': 'Error while getting relation!' };
                                res.send(json);
                            } else  {
                                var query1 = {"clientId": getRelation.clientId, "relativeClientId": getRelation.relativeClientId};
                                var query2 = {"clientId": getRelation.relativeClientId, "relativeClientId": getRelation.clientId};
                                RELATIVES_COLLECTION.remove({ $or:[query1, query2] }, function (error, result) {
                                    if (error) {
                                        json.status = '0';
                                        json.result = { 'error': 'Error in deleting relative!' };
                                        res.send(json);
                                    } else {
                                        var relative1 = new RELATIVES_COLLECTION(relativeObjectFirst);
                                        relative1.save(function (error, client1) {
                                            if (error) {
                                                json.status = '0';
                                                json.result = { 'error': 'Error in updating relative 1 !' };
                                                res.send(json);
                                            } else {
                                                var relativeObjectTwo = {
                                                    'clientId': req.body.relativeClientId, 
                                                    'relativeClientId': req.body.clientId,
                                                    'relation': COMMON_ROUTE.getRelation(req.body.relation, getClient.gender)
                                                }
                                                var relative2 = new RELATIVES_COLLECTION(relativeObjectTwo);
                                                relative2.save(function (error, client2) {
                                                    if (error) {
                                                        json.status = '0';
                                                        json.result = { 'error': 'Error in updating relative 2 !' };
                                                        res.send(json);
                                                    } else {
                                                        json.status = '1';
                                                        json.result = { 'message': 'Relative updated successfully.', '_id':relativeId };
                                                        res.send(json);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
		});
	}
}


/*
TODO: POST To Remove Relative By Id
*/
function _removeRelativeById(req, res, next) {
	var relativeId = req.params.id;

	if(!COMMON_ROUTE.isValidId(relativeId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Client Id!' };
		res.send(json);
	} else { 
		RELATIVES_COLLECTION.findOne({ _id: new ObjectID(relativeId)}, function (relativeerror, getRelative) {
				if (relativeerror || !getRelative) {
					json.status = '0';
					json.result = { 'message': 'Relative not exists!' };
					res.send(json);
				} else {
                    var query1 = {"clientId": getRelative.clientId, "relativeClientId": getRelative.relativeClientId};
                    var query2 = {"clientId": getRelative.relativeClientId, "relativeClientId": getRelative.clientId};
					RELATIVES_COLLECTION.remove({ $or:[query1, query2] }, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in deleting relative!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Relative deleted successfully.','_id': relativeId };
							res.send(json);
						}
					});
				}
		});
	}
}

function _getRelatives(req, res, next) {
	var query = {};
	var countQuery ={};
	var limit = (req.body.limit)? req.body.limit : 10;
	var pageCount = (req.body.pageCount)? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;

	RELATIVES_COLLECTION.count(countQuery,function(err,count){
		totalRecords = count;

		RELATIVES_COLLECTION.find(query, function (relativeerror, relatives) {
			if (relativeerror || !relatives || relatives.length <= 0) {
				json.status = '0';
				json.result = { 'message': 'Relatives not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Relatives  found successfully.', 'realtiveId':relatives._id , 'relatives': relatives, 'totalRecords':totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});
}
function _getRelativesByClientId(req, res, next) {
    var query = {};
    clientId = req.body.clientId;
    var countQuery ={};
    var totalRecords = 0;
    var clients = [];
    var relations ={}


    RELATIVES_COLLECTION.count(countQuery,function(err,count){
        totalRecords = count;


        RELATIVES_COLLECTION.find({clientId:clientId}, function (relativeerror, relatives) {
            if (relativeerror || !relatives || relatives.length <= 0) {
                json.status = '0';
                json.result = { 'message': 'Relation not found!' };
                res.send(json);
            } else {
                async.forEach(relatives,function(relative,callback){
                    CLIENTS_COLLECTION.findById(relative.relativeClientId,{firstName:1,lastName:1}, function(err,client){
                        if(client){
                            relations =  { 
                                'relativeClientId':client._id,
                                'relativeClientFirstName':client.firstName,
                                'relativeClientlastName':client.lastName,
                                'relation':relative.relation,
                                'relativeId':relative._id,
                            };
                        } else {
                            relations = {};
                        }
                    clients.push(relations);
                        callback();  
                    });
                   
                },function(err){
                    json.status = '1';
                    json.result = { 'message': 'Relatives  found successfully.', 'relatives': relatives ,'clients':clients,'totalRecords':totalRecords };
                    res.send(json);
                });
            }
        });
    });
}