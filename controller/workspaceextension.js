var model = require('../models/model');
var WORK_EXTENSION_COLLECTION = model.workspace_extensions;
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
exports.addWorkspaceExtension = _addWorkspaceExtension;
exports.getWorkspaceExtensionById = _getWorkspaceExtensionById;
exports.getWorkspaceExtensionByClientId = _getWorkspaceExtensionByClientId;
exports.getWorkspaceExtensions = _getWorkspaceExtensions;
exports.updateWorkspaceExtensionById = _updateWorkspaceExtensionById;
exports.removeWorkspaceExtensionById = _removeWorkspaceExtensionById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new workspaceExtension.
*/
function _addWorkspaceExtension(req, res, next) {
    var json = {};
    var workspaceExtensionObject = {
        'clientId': req.body.clientId,
        'title': req.body.title,
        'type': req.body.type,
        'emailCounter': req.body.emailCounter
    }


    if (COMMON_ROUTE.isUndefinedOrNull(workspaceExtensionObject.clientId)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var workspaceExtension = new WORK_EXTENSION_COLLECTION(workspaceExtensionObject);

        workspaceExtension.save(function(error, workspaceExtension) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new workspaceExtension!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New Workspace Extension added successfully.', '_id': workspaceExtension._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update WorkspaceExtension By Id
*/
function _updateWorkspaceExtensionById(req, res, next) {
    var workspaceExtensionId = req.params.id;
    

    if (!COMMON_ROUTE.isValidId(workspaceExtensionId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid WorkspaceExtension Id!' };
        res.send(json);
    } else {
        var workspaceExtensionObject = {
            'clientId': req.body.clientId,
            'title': req.body.title,
            'type': req.body.type,
            'emailCounter': req.body.emailCounter
        }

        if (COMMON_ROUTE.isUndefinedOrNull(workspaceExtensionObject.clientId)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: workspaceExtensionObject
            };

            WORK_EXTENSION_COLLECTION.find({ _id: new ObjectID(workspaceExtensionId) }, function(workspaceExtensionerror, getWorkspaceExtension) {
                if (workspaceExtensionerror || !getWorkspaceExtension) {
                    json.status = '0';
                    json.result = { 'message': 'WorkspaceExtension not exists!' };
                    res.send(json);
                } else {
                    WORK_EXTENSION_COLLECTION.update({ _id: new ObjectID(workspaceExtensionId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating workspace extension!' + error};
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Workspace Extension updated successfully.', '_id': workspaceExtensionId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove WorkspaceExtension By Id
*/
function _removeWorkspaceExtensionById(req, res, next) {
    var workspaceExtensionId = req.params.id;

    if (!COMMON_ROUTE.isValidId(workspaceExtensionId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid WorkspaceExtension Id!' };
        res.send(json);
    } else {
        WORK_EXTENSION_COLLECTION.find({ _id: new ObjectID(workspaceExtensionId) }, function(workspaceExtensionerror, getWorkspaceExtension) {
            if (workspaceExtensionerror || !getWorkspaceExtension) {
                json.status = '0';
                json.result = { 'message': 'WorkspaceExtension not exists!' };
                res.send(json);
            } else {
                WORK_EXTENSION_COLLECTION.deleteOne({ _id: new ObjectID(workspaceExtensionId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting workspace extension!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'WorkspaceExtension deleted successfully.', '_id': workspaceExtensionId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get workspaceExtension by Id.
*/
function _getWorkspaceExtensionById(req, res, next) {
    var workspaceExtensionId = req.params.id;

    if (!COMMON_ROUTE.isValidId(workspaceExtensionId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid WorkspaceExtension Id!' };
        res.send(json);
    } else {
        WORK_EXTENSION_COLLECTION.findOne({ _id: new ObjectID(workspaceExtensionId) }, function(workspaceExtensionerror, getWorkspaceExtension) {
            if (workspaceExtensionerror || !getWorkspaceExtension) {
                json.status = '0';
                json.result = { 'message': 'WorkspaceExtension not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'WorkspaceExtension found successfully.', 'workspaceExtension': getWorkspaceExtension };
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To get workspaceExtension by client Id.
*/
function _getWorkspaceExtensionByClientId(req, res, next) {
    var clientId = req.params.clientId;

    if (!COMMON_ROUTE.isValidId(clientId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid client Id!' };
        res.send(json);
    } else {
        WORK_EXTENSION_COLLECTION.find({ clientId: clientId }, function(workspaceExtensionerror, getWorkspaceExtensions) {
            if (workspaceExtensionerror || !getWorkspaceExtensions) {
                json.status = '0';
                json.result = { 'message': 'Workspace Extension not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Workspace Extension found successfully.', 'workspaceExtensions': getWorkspaceExtensions };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get workspaceExtensions.
*/
function _getWorkspaceExtensions(req, res, next) {
    var query = {};
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    WORK_EXTENSION_COLLECTION.count(countQuery, function(err, count) {
        totalRecords = count;

        WORK_EXTENSION_COLLECTION.find(query, function(workspaceExtensionerror, workspaceExtensions) {
            if (workspaceExtensionerror || !workspaceExtensions) {
                json.status = '0';
                json.result = { 'message': 'WorkspaceExtensions not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'WorkspaceExtensions found successfully.', 'workspaceExtensions': workspaceExtensions, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}