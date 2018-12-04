var model = require('../models/model');
var SETTINGS_COLLECTION = model.settings;
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
exports.addSetting = _addSetting;
exports.getSettingById = _getSettingById;
exports.getSettings = _getSettings;
exports.updateSettingById = _updateSettingById;
exports.removeSettingById = _removeSettingById;
exports.getSettingByKey = _getSettingByKey;
/*-------------------------------------------------------*/

/*
TODO: POST To add new setting.
*/
function _addSetting(req, res, next) {
    var json = {};
    var settingObject = {
        'settingKey': req.body.settingKey,
        'settingValues': req.body.settingValues
    }

    if (COMMON_ROUTE.isUndefinedOrNull(settingObject.settingKey)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var setting = new SETTINGS_COLLECTION(settingObject);

        setting.save(function (error, setting) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new setting!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New setting added successfully.', '_id': setting._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Setting By Id
*/
function _updateSettingById(req, res, next) {
    var settingId = req.params.id;

    if (!COMMON_ROUTE.isValidId(settingId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Setting Id!' };
        res.send(json);
    } else {
        var settingObject = {
            'settingKey': req.body.settingKey,
            'settingValues': req.body.settingValues
        }

        if (COMMON_ROUTE.isUndefinedOrNull(settingObject.settingKey)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: settingObject
            };

            SETTINGS_COLLECTION.find({ _id: new ObjectID(settingId) }, function (settingerror, getSetting) {
                if (settingerror || !getSetting) {
                    json.status = '0';
                    json.result = { 'message': 'Setting not exists!' };
                    res.send(json);
                } else {
                    SETTINGS_COLLECTION.update({ _id: new ObjectID(settingId) }, query, function (error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating setting!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Setting updated successfully.', '_id': settingId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove Setting By Id
*/
function _removeSettingById(req, res, next) {
    var settingId = req.params.id;

    if (!COMMON_ROUTE.isValidId(settingId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Setting Id!' };
        res.send(json);
    } else {
        SETTINGS_COLLECTION.find({ _id: new ObjectID(settingId) }, function (settingerror, getSetting) {
            if (settingerror || !getSetting) {
                json.status = '0';
                json.result = { 'message': 'Setting not exists!' };
                res.send(json);
            } else {
                SETTINGS_COLLECTION.deleteOne({ _id: new ObjectID(settingId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting setting!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Setting deleted successfully.', '_id': settingId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get setting by Id.
*/
function _getSettingById(req, res, next) {
    var settingId = req.params.id;

    if (!COMMON_ROUTE.isValidId(settingId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Setting Id!' };
        res.send(json);
    } else {
        SETTINGS_COLLECTION.findOne({ _id: new ObjectID(settingId) }, function (settingerror, getSetting) {
            if (settingerror || !getSetting) {
                json.status = '0';
                json.result = { 'message': 'Setting not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Setting found successfully.', 'setting': getSetting };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get settings.
*/
function _getSettings(req, res, next) {
    var query = {};
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    SETTINGS_COLLECTION.find(query, function (settingerror, settings) {
        if (settingerror || !settings) {
            json.status = '0';
            json.result = { 'message': 'Settings not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Settings found successfully.', 'settings': settings };
            res.send(json);
        }
    }).skip(skip).limit(limit);
}

//For Getting Settings By Key

function _getSettingByKey(req, res, next) {
    var settingKey = req.body.settingObject;

    var query = { settingKey: settingKey }; 

    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var mysort = { settingKey: 1 };
    SETTINGS_COLLECTION.count(countQuery, function (err, count) {
        totalRecords = count;
        //SETTINGS_COLLECTION.find().sort(mysort).toArray(query, function(settingerror, settings) {  
        SETTINGS_COLLECTION.find(query, function (settingerror, settings) {
            if (settingerror || !settings) {
                json.status = '0';
                json.result = { 'message': 'Settings not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Settings found successfully.', 'settings': settings, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}