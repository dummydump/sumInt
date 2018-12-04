var model = require('../models/model');
var TRIP_DETAILS_COLLECTION = model.trip_details;
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
exports.addTripDetails = _addTripDetails;
exports.getTripDetailsById = _getTripDetailsById;
exports.getTripDetails = _getTripDetails;
exports.updateTripDetailsById = _updateTripDetailsById;
exports.removeTripDetailsById = _removeTripDetailsById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new tripDetails.
*/
var tripDetailsObject = {};

function _addTripDetails(req, res, next) {
    var json = {},
        tripDetailsObject = {
            tripId: req.body.tripId,
            tripDetailType: req.body.tripDetailType,
            tripDetailContent: req.body.tripDetailContent
        }

    if (COMMON_ROUTE.isUndefinedOrNull(tripDetailsObject.tripId)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var tripDetails = new TRIP_DETAILS_COLLECTION(tripDetailsObject);

        tripDetails.save(function(error, tripDetails) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new tripDetails!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Trip Details added successfully.', '_id': tripDetails._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update TripDetails By Id
*/
function _updateTripDetailsById(req, res, next) {
    var tripDetailsId = req.body._id;

    if (!COMMON_ROUTE.isValidId(tripDetailsId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid TripDetails Id!' };
        res.send(json);
    } else {
        var tripDetailsObject = {
            tripId: req.body.tripId,
            tripDetailType: req.body.tripDetailType,
            tripDetailContent: req.body.tripDetailContent
        }

        if (COMMON_ROUTE.isUndefinedOrNull(tripDetailsObject.tripId) && COMMON_ROUTE.isUndefinedOrNull(tripDetailsId)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: tripDetailsObject
            };

            TRIP_DETAILS_COLLECTION.find({ _id: new ObjectID(tripDetailsId) }, function(tripDetailserror, getTripDetails) {
                if (tripDetailserror || !getTripDetails) {
                    json.status = '0';
                    json.result = { 'message': 'TripDetails not exists!' };
                    res.send(json);
                } else {
                    TRIP_DETAILS_COLLECTION.update({ _id: new ObjectID(tripDetailsId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating tripDetails!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Trip Details updated successfully.', '_id': tripDetailsId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove TripDetails By Id
*/
function _removeTripDetailsById(req, res, next) {
    var tripDetailsId = req.params.id;

    if (!COMMON_ROUTE.isValidId(tripDetailsId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid TripDetails Id!' };
        res.send(json);
    } else {
        TRIP_DETAILS_COLLECTION.find({ _id: new ObjectID(tripDetailsId) }, function(tripDetailserror, getTripDetails) {
            if (tripDetailserror || !getTripDetails) {
                json.status = '0';
                json.result = { 'message': 'TripDetails not exists!' };
                res.send(json);
            } else {
                TRIP_DETAILS_COLLECTION.deleteOne({ _id: new ObjectID(tripDetailsId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting tripDetails!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Trip Details deleted successfully.', '_id': tripDetailsId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get tripDetails by Id.
*/
function _getTripDetailsById(req, res, next) {
    var tripDetailsId = req.params.id;

    if (!COMMON_ROUTE.isValidId(tripDetailsId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid TripDetails Id!' };
        res.send(json);
    } else {
        TRIP_DETAILS_COLLECTION.findOne({ _id: new ObjectID(tripDetailsId) }, function(tripDetailserror, getTripDetails) {
            if (tripDetailserror || !getTripDetails) {
                json.status = '0';
                json.result = { 'message': 'TripDetails not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Trip Details found successfully.', 'tripDetails': getTripDetails };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get tripDetails.
*/
function _getTripDetails(req, res, next) {
    var query = { tripId: req.body.tripId };
    var countQuery = {};
    var totalRecords = 0;

    TRIP_DETAILS_COLLECTION.find(query, function(tripDetailserror, tripDetails) {
        if (tripDetailserror || !tripDetails) {
            json.status = '0';
            json.result = { 'message': 'TripDetails not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Trip Details found successfully.', 'tripDetails': tripDetails };
            res.send(json);
        }
    });
}