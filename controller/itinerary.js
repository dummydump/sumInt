var model = require('../models/model');
var ITINERARIES_COLLECTION = model.itineraries;
var CRUISE_ITINERARIES_COLLECTION = model.cruise_itineraries;
var PORTS_COLLECTION = model.ports;
var SHIPS_COLLECTION = model.ships;
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
exports.addItinerary = _addItinerary;
exports.getItineraryById = _getItineraryById;
exports.getItineraryByTripId = _getItineraryByTripId;
exports.getItineraries = _getItineraries;
exports.updateItineraryById = _updateItineraryById;
exports.removeItineraryById = _removeItineraryById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new itinerary.
*/
function _addItinerary(req, res, next) {
    var json = {};
    var itineraryObject = {
        'templateName': req.body.templateName,
        'tripId': req.body.tripId,
        'clientId': req.body.clientId,
        'flights': req.body.flights,
        'properties': req.body.properties,
        'cruises': req.body.cruises,
        'tours': req.body.tours,
        'trains': req.body.trains,
        'carRentals': req.body.carRentals,
        'groundTransfer': req.body.groundTransfer
    }

    if (COMMON_ROUTE.isUndefinedOrNull(itineraryObject.templateName) || COMMON_ROUTE.isUndefinedOrNull(itineraryObject.tripId)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var itinerary = new ITINERARIES_COLLECTION(itineraryObject);

        itinerary.save(function (error, itinerary) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new itinerary!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New itinerary added successfully.', '_id': itinerary._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Itinerary By Id
*/
function _updateItineraryById(req, res, next) {
    var itineraryId = req.params.id;

    if (!COMMON_ROUTE.isValidId(itineraryId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Itinerary Id!' };
        res.send(json);
    } else {

        req.body.cruises.forEach(function (v) { delete v.cruiseItineraries });

        var itineraryObject = {
            'templateName': req.body.templateName,
            'tripId': req.body.tripId,
            'clientId': req.body.clientId,
            'flights': req.body.flights,
            'properties': req.body.properties,
            'cruises': req.body.cruises,
            'tours': req.body.tours,
            'trains': req.body.trains,
            'carRentals': req.body.carRentals,
            'groundTransfer': req.body.groundTransfer
        }

        if (COMMON_ROUTE.isUndefinedOrNull(itineraryObject.templateName) || COMMON_ROUTE.isUndefinedOrNull(itineraryObject.tripId)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: itineraryObject
            };

            ITINERARIES_COLLECTION.find({ _id: new ObjectID(itineraryId) }, function (itineraryerror, getItinerary) {
                if (itineraryerror || (!getItinerary)) {
                    json.status = '0';
                    json.result = { 'message': 'Itinerary not exists!' };
                    res.send(json);
                } else {
                    ITINERARIES_COLLECTION.update({ _id: new ObjectID(itineraryId) }, query, function (error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating itinerary!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Itinerary updated successfully.', '_id': itineraryId };
                            res.send(json);
                        }
                    });
                }
            });

        }
    }
}

/*
TODO: POST To Remove Itinerary By Id
*/
function _removeItineraryById(req, res, next) {
    var itineraryId = req.params.id;

    if (!COMMON_ROUTE.isValidId(itineraryId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Itinerary Id!' };
        res.send(json);
    } else {
        ITINERARIES_COLLECTION.find({ _id: new ObjectID(itineraryId) }, function (itineraryerror, getItinerary) {
            if (itineraryerror || (!getItinerary)) {
                json.status = '0';
                json.result = { 'message': 'Itinerary not exists!' };
                res.send(json);
            } else {
                ITINERARIES_COLLECTION.deleteOne({ _id: new ObjectID(itineraryId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting itinerary!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Itinerary deleted successfully.', '_id': itineraryId };
                        res.send(json);
                    }
                });
            }
        });
    }
}



/*
TODO: GET To get itinerary by Id.
*/
function _getItineraryById(req, res, next) {
    var itineraryId = req.params.id;

    if (!COMMON_ROUTE.isValidId(itineraryId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Itinerary Id!' };
        res.send(json);
    } else {
        ITINERARIES_COLLECTION.findOne({ _id: new ObjectID(itineraryId) }, function (itineraryerror, getItinerary) {
            if (itineraryerror || (!getItinerary)) {
                json.status = '0';
                json.result = { 'message': 'Itinerary not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Itinerary found successfully', 'itinerary': getItinerary };
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To get itinerary by Trip Id.
*/
function _getItineraryByTripId(req, res, next) {
    var tripId = req.params.tripId;
    var array = [];
    var flage = 0;

    if (!COMMON_ROUTE.isValidId(tripId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Itinerary Id!' };
        res.send(json);
    } else {
        ITINERARIES_COLLECTION.findOne({ 'tripId': tripId },
            function (itineraryerror, getItinerary) {
                if (itineraryerror || !getItinerary) {
                    json.status = '0';
                    json.result = { 'message': 'Itinerary not exists!' };
                    res.send(json);
                } else {

                    if (getItinerary.cruises.length <= 0) {
                        json.status = '1';
                        json.result = { 'message': 'Cruise Itineraries found successfully.', 'itinerary': getItinerary };
                        res.send(json);
                    } else {
                        FilterCruiseItinerary(getItinerary, function (error, itineraryRes) {
                            if (error) {
                                json.status = '0';
                                json.result = { 'message': 'cruise itineraries data not exists!' + error };
                                res.send(json);
                            } else {
                                json.status = '1';
                                json.result = { 'message': 'Cruise Itineraries found successfully.', 'itinerary': itineraryRes };
                                res.send(json);
                            }
                        });
                    }
                }
            });
    }
}

function GetCruiseItinerariesById(cruiseItineraryId, callback) {
    CRUISE_ITINERARIES_COLLECTION.findOne({ '_id': new ObjectID(cruiseItineraryId) },
        function (cruise_itineraries_collection_err, cruise_itineraries_collection) {

            if (cruise_itineraries_collection_err || !cruise_itineraries_collection) {
                callback('cruise itineraries data not exists!', null);
            } else {
                if (cruise_itineraries_collection && cruise_itineraries_collection.shipId != '') {
                    SHIPS_COLLECTION.findOne({ '_id': new ObjectID(cruise_itineraries_collection.shipId) },
                        function (ship_err, ship_res) {
                            if (ship_err || !ship_res) {
                                callback(null, cruise_itineraries_collection);
                            } else {
                                cruise_itineraries_collection.shipName = ship_res.name;
                                callback(null, cruise_itineraries_collection);
                            }
                        });
                } else {
                    callback(null, cruise_itineraries_collection);
                }
            }
        });
}

function GetPortById(portId, callback) {

    PORTS_COLLECTION.findOne({ '_id': new ObjectID(portId) },
        function (port_err, port_res) {
            if (port_err) {
                callback('port collection not exists!', null);
            } else {
                callback(null, port_res);
            }
        });
}

function FilterCruiseItinerary(itinerary, callback) {
    var getItinerary = itinerary;

    var cruiseCounter = 0;

    getItinerary.cruises.forEach((e1, i1) => {
        GetCruiseItinerariesById(e1.cruiseItineraryId, function (cruise_itineraries_collection_err, cruise_itineraries_collection) {
            if (cruise_itineraries_collection_err || !cruise_itineraries_collection) {
                cruiseCounter++;
                callback(cruise_itineraries_collection_err, getItinerary);
            } else {
                var cruiseItinerary = [];

                if (cruise_itineraries_collection.itinerary.length > 0) {
                    cruiseCounter++;
                    var portCounter = 0;

                    getItinerary.cruises[i1]['shipName'] = cruise_itineraries_collection.shipName;
                    getItinerary.cruises[i1]['title'] = cruise_itineraries_collection.title;

                    cruise_itineraries_collection.itinerary.forEach((e2, i2) => {
                        GetPortById(e2.port_id, function (port_err, port_res) {

                            if (port_err) {
                                callback(port_err, getItinerary);
                            } else {
                                e2.port = port_res;
                                cruiseItinerary.push(e2);

                                portCounter++;

                                if (cruise_itineraries_collection.itinerary.length == (portCounter)) {

                                    getItinerary.cruises[i1]['cruiseItineraries'] = [];

                                    var obj = {
                                        "title": e2.title,
                                        "shipId": e2.shipId,
                                        "departure_port_id": e2.departure_port_id,
                                        "no_of_day": e2.no_of_day,
                                        "itinerary": cruiseItinerary
                                    }

                                    getItinerary.cruises[i1]['cruiseItineraries'].push(obj);

                                    if (getItinerary.cruises.length == (cruiseCounter)) {
                                        callback(null, getItinerary);
                                        // json.status = '1';
                                        // json.result = { 'message': 'Cruise Itineraries found successfully.', 'itinerary': getItinerary };
                                        // res.send(json);
                                    }
                                }
                            }
                        });
                    });
                } else {
                    cruiseCounter++;
                    callback(null, getItinerary);
                }
            }
        });
    });
}


/*
TODO: GET To get itineraries.
*/
function _getItineraries(req, res, next) {
    var query = {};
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    ITINERARIES_COLLECTION.count(countQuery, function (err, count) {
        totalRecords = count;

        ITINERARIES_COLLECTION.find(query, function (itineraryerror, itineraries) {
            if (itineraryerror || !itineraries || itineraries.length <= 0) {
                json.status = '0';
                json.result = { 'message': 'Itineraries not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Itineraries found successfully.', 'itineraries': itineraries, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}