var model = require('../models/model');
var TEMPLATES_COLLECTION = model.templates;
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
exports.addTemplate = _addTemplate;
exports.getTemplateById = _getTemplateById;
exports.getTemplates = _getTemplates;
exports.updateTemplateById = _updateTemplateById;
exports.removeTemplateById = _removeTemplateById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new template.
*/
function _addTemplate(req, res, next) {
    var json = {};
    var templateObject = {
        'type': req.body.type,
        'subject': req.body.subject,
        'body': req.body.body
    }

    if (COMMON_ROUTE.isUndefinedOrNull(templateObject.clientId)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var template = new TEMPLATES_COLLECTION(templateObject);

        template.save(function(error, template) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new template!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New Template added successfully.', '_id': template._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Template By Id
*/
function _updateTemplateById(req, res, next) {
    var templateId = req.params.id;

    if (!COMMON_ROUTE.isValidId(templateId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Template Id!' };
        res.send(json);
    } else {
        var templateObject = {
            'type': req.body.type,
            'subject': req.body.subject,
            'body': req.body.body
        }

        if (COMMON_ROUTE.isUndefinedOrNull(templateObject.subject)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: templateObject
            };

            TEMPLATES_COLLECTION.find({ _id: new ObjectID(templateId) }, function(templateerror, getTemplate) {
                if (templateerror || !getTemplate) {
                    json.status = '0';
                    json.result = { 'message': 'Template not exists!' };
                    res.send(json);
                } else {
                    TEMPLATES_COLLECTION.update({ _id: new ObjectID(templateId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating Template!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Template updated successfully.', '_id': templateId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove Template By Id
*/
function _removeTemplateById(req, res, next) {
    var templateId = req.params.id;

    if (!COMMON_ROUTE.isValidId(templateId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Template Id!' };
        res.send(json);
    } else {
        TEMPLATES_COLLECTION.find({ _id: new ObjectID(templateId) }, function(templateerror, getTemplate) {
            if (templateerror || !getTemplate) {
                json.status = '0';
                json.result = { 'message': 'Template not exists!' };
                res.send(json);
            } else {
                TEMPLATES_COLLECTION.deleteOne({ _id: new ObjectID(templateId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting Template!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Template deleted successfully.', '_id': templateId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get template by Id.
*/
function _getTemplateById(req, res, next) {
    var templateId = req.params.id;

    if (!COMMON_ROUTE.isValidId(templateId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Template Id!' };
        res.send(json);
    } else {
        TEMPLATES_COLLECTION.findOne({ _id: new ObjectID(templateId) }, function(templateerror, getTemplate) {
            if (templateerror || !getTemplate) {
                json.status = '0';
                json.result = { 'message': 'Template not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Template found successfully.', 'template': getTemplate };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get templates.
*/
function _getTemplates(req, res, next) {
    var query = {};
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    TEMPLATES_COLLECTION.count(countQuery, function(err, count) {
        totalRecords = count;

        TEMPLATES_COLLECTION.find(query, function(templateerror, templates) {
            if (templateerror || !templates) {
                json.status = '0';
                json.result = { 'message': 'Templates not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Templates found successfully.', 'templates': templates, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}