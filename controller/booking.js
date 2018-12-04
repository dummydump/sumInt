var model = require('../models/model');
var BOOKINGS_COLLECTION = model.bookings;
var PAYMENTS_COLLECTION = model.payments;
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
exports.addBooking = _addBooking;
exports.getBookingById = _getBookingById;
exports.getBookings = _getBookings;
exports.updateBookingById = _updateBookingById;
exports.removeBookingById = _removeBookingById;
exports.getAllBookingsByTripId = _getAllBookingsByTripId;
exports.getPaymentsByTripId = _getPaymentsByTripId;
/*-------------------------------------------------------*/

/*
TODO: POST To add new booking.
*/
function _addBooking(req, res, next) {
    var json = {};
    var bookingObject = {
        'tripId': req.body.tripId,
        'bookingNumber': req.body.bookingNumber,
        'groupBookingId': req.body.groupBookingId,
        'bookingDate': req.body.bookingDate,
        'tourOperatorId': req.body.tourOperatorId,
        'startDate': req.body.startDate,
        'endDate': req.body.endDate,
        'packagePrice': req.body.packagePrice,
        'commisionEarned': req.body.commisionEarned,
        'alternateCommision': req.body.alternateCommision,
        'personalTravel': req.body.personalTravel,
        'commisionExpected': req.body.commisionExpected,
        'agentName': req.body.agentName,
        'bookingStatus': req.body.bookingStatus,
        'description': req.body.description
    }

    if (COMMON_ROUTE.isUndefinedOrNull(bookingObject.tripId) || COMMON_ROUTE.isUndefinedOrNull(bookingObject.bookingNumber) || COMMON_ROUTE.isUndefinedOrNull(bookingObject.bookingDate) || COMMON_ROUTE.isUndefinedOrNull(bookingObject.packagePrice)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var booking = new BOOKINGS_COLLECTION(bookingObject);

        booking.save(function(error, booking) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new booking!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New booking added successfully.', '_id': booking._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Booking By Id
*/
function _updateBookingById(req, res, next) {
    var bookingId = req.params.id;

    if (!COMMON_ROUTE.isValidId(bookingId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Booking Id!' };
        res.send(json);
    } else {
        var bookingObject = {
            'tripId': req.body.tripId,
            'bookingNumber': req.body.bookingNumber,
            'groupBookingId': req.body.groupBookingId,
            'bookingDate': req.body.bookingDate,
            'tourOperatorId': req.body.tourOperatorId,
            'startDate': req.body.startDate,
            'endDate': req.body.endDate,
            'packagePrice': req.body.packagePrice,
            'commisionEarned': req.body.commisionEarned,
            'alternateCommision': req.body.alternateCommision,
            'personalTravel': req.body.personalTravel,
            'commisionExpected': req.body.commisionExpected,
            'agentName': req.body.agentName,
            'bookingStatus': req.body.bookingStatus,
            'description': req.body.description
        }

        if (COMMON_ROUTE.isUndefinedOrNull(bookingObject.tripId) || COMMON_ROUTE.isUndefinedOrNull(bookingObject.bookingNumber) || COMMON_ROUTE.isUndefinedOrNull(bookingObject.bookingDate) || COMMON_ROUTE.isUndefinedOrNull(bookingObject.packagePrice)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: bookingObject
            };

            BOOKINGS_COLLECTION.find({ _id: new ObjectID(bookingId) }, function(bookingerror, getBooking) {
                if (bookingerror || !getBooking) {
                    json.status = '0';
                    json.result = { 'message': 'Booking not exists!' };
                    res.send(json);
                } else {
                    BOOKINGS_COLLECTION.update({ _id: new ObjectID(bookingId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating booking!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Booking updated successfully.', '_id': bookingId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove Booking By Id
*/
function _removeBookingById(req, res, next) {
    var bookingId = req.params.id;

    if (!COMMON_ROUTE.isValidId(bookingId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Booking Id!' };
        res.send(json);
    } else {
        BOOKINGS_COLLECTION.find({ _id: new ObjectID(bookingId) }, function(bookingerror, getBooking) {
            if (bookingerror || !getBooking) {
                json.status = '0';
                json.result = { 'message': 'Booking not exists!' };
                res.send(json);
            } else {
                BOOKINGS_COLLECTION.deleteOne({ _id: new ObjectID(bookingId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting booking!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Booking deleted successfully.', '_id': bookingId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get booking by Id.
*/
function _getBookingById(req, res, next) {
    var bookingId = req.params.id;

    if (!COMMON_ROUTE.isValidId(bookingId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Booking Id!' };
        res.send(json);
    } else {
        BOOKINGS_COLLECTION.findOne({ _id: new ObjectID(bookingId) }, function(bookingerror, getBooking) {
            if (bookingerror || !getBooking) {
                json.status = '0';
                json.result = { 'message': 'Booking not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Booking found successfully.', 'booking': getBooking };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get bookings.
*/
function _getBookings(req, res, next) {
    //var query = { tripId: req.body.tripId };
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    var search = {};
	var NumberQuery = {};
    var SenderQuery = {};
    //var CheckNumberQuery = {};
    var TripQuery = {};
    var UnpaidCheckQuery = {};

    if(req.body.forCheck)
    {
        UnpaidCheckQuery = { $or :[{'bookingStatus': 'Active'},{'bookingStatus': 'Partial Paid'}] };
    }

    if(req.body.tripId)
    {
        TripQuery = { tripId : req.body.tripId };
        console.log(TripQuery);
    }

    if (req.body.search) {
        search = Object.assign({}, req.body.search);
    }
    if (search) {
        if (search.number) {
			NumberQuery = { bookingNumber : { $regex: new RegExp("^" + search.number.toLowerCase(), "i") } };
			console.log(NumberQuery);
        }
    }

    query  = Object.assign({},TripQuery, NumberQuery,UnpaidCheckQuery);

    BOOKINGS_COLLECTION.count(query, function(err, count) {
        totalRecords = count;
        BOOKINGS_COLLECTION.find(query, function(bookingerror, bookings) {
            if (bookingerror || !bookings) {
                json.status = '0';
                json.result = { 'message': 'Bookings not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Bookings found successfully.', 'bookings': bookings, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });


}


function _getAllBookingsByTripId (req, res, next) {
    var query = { tripId: req.body.tripId };
    var totalRecords = 0;
    BOOKINGS_COLLECTION.find(query, function(bookingerror, bookings) {
        if (bookingerror || !bookings) {
            json.status = '0';
            json.result = { 'message': 'Booking not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Booking found successfully.', 'bookings': bookings};
            res.send(json);
        }
    });
}

function _getPaymentsByTripId (req, res, next) {
    var query = { tripId: req.body.tripId };
    var totalRecords = 0;
    PAYMENTS_COLLECTION.find(query, function(paymenterror, payments) {
        if (paymenterror || !payments) {
            json.status = '0';
            json.result = { 'message': 'Payments not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Payments found successfully.', 'payments': payments };
            res.send(json);
        }
    });
}