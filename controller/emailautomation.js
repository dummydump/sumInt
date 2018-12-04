var model = require('../models/model');
var EMAIL_AUTOMATION_COLLECTION = model.email_automation;
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
exports.addEmailAutomation = _addEmailAutomation;
exports.getEmailAutomationById = _getEmailAutomationById;
exports.getEmailAutomationByWorkspaceExtIds = _getEmailAutomationByWorkspaceExtIds;
exports.getEmailAutomations = _getEmailAutomations;
exports.updateEmailAutomationById = _updateEmailAutomationById;
exports.removeEmailAutomationById = _removeEmailAutomationById;
exports.removeEmailAutomationByWorkExtId = _removeEmailAutomationByWorkExtId;
/*-------------------------------------------------------*/

/*
TODO: POST To add new emailAutomation.
*/
function _addEmailAutomation(req, res, next) {
    var json = {};
    var emailAutomationObject = {
        'templateId': req.body.templateId,
        'sendDate': req.body.sendDate,
        'sendTime': req.body.sendTime,
        'placeholders': req.body.placeholders,
        'workspaceExtensionId': req.body.workspaceExtensionId
    }

    if (COMMON_ROUTE.isUndefinedOrNull(emailAutomationObject.templateId) || COMMON_ROUTE.isUndefinedOrNull(emailAutomationObject.sendDate) || COMMON_ROUTE.isUndefinedOrNull(emailAutomationObject.workspaceExtensionId)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var emailAutomation = new EMAIL_AUTOMATION_COLLECTION(emailAutomationObject);

        emailAutomation.save(function(error, emailAutomation) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new emailAutomation!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New Email Automation added successfully.', '_id': emailAutomation._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update EmailAutomation By Id
*/
function _updateEmailAutomationById(req, res, next) {
    var emailAutomationId = req.params.id;

    if (!COMMON_ROUTE.isValidId(emailAutomationId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid EmailAutomation Id!' };
        res.send(json);
    } else {
        var emailAutomationObject = {
            'templateId': req.body.templateId,
            'sendDate': req.body.sendDate,
            'sendTime': req.body.sendTime,
            'placeholders': req.body.placeholders,
            'workspaceExtensionId': req.body.workspaceExtensionId
        }

        if (COMMON_ROUTE.isUndefinedOrNull(emailAutomationObject.templateId) || COMMON_ROUTE.isUndefinedOrNull(emailAutomationObject.sendDate) || COMMON_ROUTE.isUndefinedOrNull(emailAutomationObject.sendTime) || COMMON_ROUTE.isUndefinedOrNull(emailAutomationObject.workspaceExtensionId)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: emailAutomationObject
            };

            EMAIL_AUTOMATION_COLLECTION.find({ _id: new ObjectID(emailAutomationId) }, function(emailAutomationerror, getEmailAutomation) {
                if (emailAutomationerror || !getEmailAutomation) {
                    json.status = '0';
                    json.result = { 'message': 'EmailAutomation not exists!' };
                    res.send(json);
                } else {
                    EMAIL_AUTOMATION_COLLECTION.update({ _id: new ObjectID(emailAutomationId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating Email Automation!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Email Automation updated successfully.', '_id': emailAutomationId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove EmailAutomation By Id
*/
function _removeEmailAutomationById(req, res, next) {
    var emailAutomationId = req.params.id;

    if (!COMMON_ROUTE.isValidId(emailAutomationId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid EmailAutomation Id!' };
        res.send(json);
    } else {
        EMAIL_AUTOMATION_COLLECTION.find({ _id: new ObjectID(emailAutomationId) }, function(emailAutomationerror, getEmailAutomation) {
            if (emailAutomationerror || !getEmailAutomation) {
                json.status = '0';
                json.result = { 'message': 'EmailAutomation not exists!' };
                res.send(json);
            } else {
                EMAIL_AUTOMATION_COLLECTION.deleteOne({ _id: new ObjectID(emailAutomationId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting Email Automation!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'EmailAutomation deleted successfully.', '_id': emailAutomationId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: POST To Remove EmailAutomation By WorkExt Id
*/
function _removeEmailAutomationByWorkExtId(req, res, next) {
    var workspaceExtensionId = req.params.workspaceExtensionId;

    if (!COMMON_ROUTE.isValidId(workspaceExtensionId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Workspace Extension Id!' };
        res.send(json);
    } else {

        EMAIL_AUTOMATION_COLLECTION.remove({ workspaceExtensionId: workspaceExtensionId }, function(error, result) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in deleting Email Automation!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'EmailAutomation deleted successfully.' };
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To get emailAutomation by Id.
*/
function _getEmailAutomationById(req, res, next) {
    var emailAutomationId = req.params.id;

    if (!COMMON_ROUTE.isValidId(emailAutomationId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid EmailAutomation Id!' };
        res.send(json);
    } else {
        EMAIL_AUTOMATION_COLLECTION.findOne({ _id: new ObjectID(emailAutomationId) }, function(emailAutomationerror, getEmailAutomation) {
            if (emailAutomationerror || !getEmailAutomation) {
                json.status = '0';
                json.result = { 'message': 'EmailAutomation not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'EmailAutomation found successfully.', 'emailAutomation': getEmailAutomation };
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To get emailAutomation by work space extension Ids.
*/
function _getEmailAutomationByWorkspaceExtIds(req, res, next) {
    var workspaceExtensionIds = req.body.workspaceExtensionIds;
    
    EMAIL_AUTOMATION_COLLECTION.findOne({ workspaceExtensionId: {$in: workspaceExtensionIds }}, function(emailAutomationerror, getEmailAutomations) {
        if (emailAutomationerror || !getEmailAutomations) {
            json.status = '0';
            json.result = { 'message': 'Email Automation not exists!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Email Automation found successfully.', 'emailAutomations': getEmailAutomations };
            res.send(json);
        }
    });
}

/*
TODO: POST To get emailAutomations.
*/
function _getEmailAutomations(req, res, next) {
    var query = {};
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    EMAIL_AUTOMATION_COLLECTION.count(countQuery, function(err, count) {
        totalRecords = count;

        EMAIL_AUTOMATION_COLLECTION.find(query, function(emailAutomationerror, emailAutomations) {
            if (emailAutomationerror || !emailAutomations) {
                json.status = '0';
                json.result = { 'message': 'EmailAutomations not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'EmailAutomations found successfully.', 'emailAutomations': emailAutomations, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}