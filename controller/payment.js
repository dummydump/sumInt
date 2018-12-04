var model = require('../models/model');
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
exports.addPayment = _addPayment;
exports.getPaymentById = _getPaymentById;
exports.getPayments = _getPayments;
exports.updatePaymentById = _updatePaymentById;
exports.removePaymentById = _removePaymentById;
exports.getAllBookingWithPayments = _getAllBookingWithPayments;
/*-------------------------------------------------------*/

/*
TODO: POST To add new payment.
*/
function _addPayment(req, res, next) {
    var json = {};
    var paymentObject = {
        'payeeClientId': req.body.payeeClientId,
        'bookingNumber': req.body.bookingNumber,
        'paymentDate': req.body.paymentDate,
        'paymentAmount': req.body.paymentAmount,
        'paymentType': req.body.paymentType,
        'clientCreditCard': req.body.clientCreditCard,
        'description': req.body.description,
        'paymentStatus': req.body.paymentStatus,
        'tripId': req.body.tripId
    }

    if (COMMON_ROUTE.isUndefinedOrNull(paymentObject.tripId) || COMMON_ROUTE.isUndefinedOrNull(paymentObject.payeeClientId) || COMMON_ROUTE.isUndefinedOrNull(paymentObject.bookingNumber)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var payment = new PAYMENTS_COLLECTION(paymentObject);

        payment.save(function(error, payment) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new payment!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New payment added successfully.', '_id': payment._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Payment By Id
*/
function _updatePaymentById(req, res, next) {
    var paymentId = req.params.id;

    if (!COMMON_ROUTE.isValidId(paymentId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Payment Id!' };
        res.send(json);
    } else {
        var paymentObject = {
            'payeeClientId': req.body.payeeClientId,
            'bookingNumber': req.body.bookingNumber,
            'paymentDate': req.body.paymentDate,
            'paymentAmount': req.body.paymentAmount,
            'paymentType': req.body.paymentType,
            'clientCreditCard': req.body.clientCreditCard,
            'description': req.body.description,
            'paymentStatus': req.body.paymentStatus,
            'tripId': req.body.tripId
        }

        if (COMMON_ROUTE.isUndefinedOrNull(paymentObject.tripId) || COMMON_ROUTE.isUndefinedOrNull(paymentObject.payeeClientId) || COMMON_ROUTE.isUndefinedOrNull(paymentObject.bookingNumber)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: paymentObject
            };

            PAYMENTS_COLLECTION.find({ _id: new ObjectID(paymentId) }, function(paymenterror, getPayment) {
                if (paymenterror || !getPayment) {
                    json.status = '0';
                    json.result = { 'message': 'Payment not exists!' };
                    res.send(json);
                } else {
                    PAYMENTS_COLLECTION.update({ _id: new ObjectID(paymentId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating payment!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Payment updated successfully.', '_id': paymentId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove Payment By Id
*/
function _removePaymentById(req, res, next) {
    var paymentId = req.params.id;

    if (!COMMON_ROUTE.isValidId(paymentId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Payment Id!' };
        res.send(json);
    } else {
        PAYMENTS_COLLECTION.find({ _id: new ObjectID(paymentId) }, function(paymenterror, getPayment) {
            if (paymenterror || !getPayment) {
                json.status = '0';
                json.result = { 'message': 'Payment not exists!' };
                res.send(json);
            } else {
                PAYMENTS_COLLECTION.deleteOne({ _id: new ObjectID(paymentId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting payment!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Payment deleted successfully.', '_id': paymentId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get payment by Id.
*/
function _getPaymentById(req, res, next) {
    var paymentId = req.params.id;

    if (!COMMON_ROUTE.isValidId(paymentId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Payment Id!' };
        res.send(json);
    } else {
        PAYMENTS_COLLECTION.findOne({ _id: new ObjectID(paymentId) }, function(paymenterror, getPayment) {
            if (paymenterror || !getPayment) {
                json.status = '0';
                json.result = { 'message': 'Payment not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Payment found successfully.', 'payment': getPayment };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get payments.
*/
function _getPayments(req, res, next) {
    var query = { tripId: req.body.tripId };
    if (req.body.tripId) {
        query.tripId = req.body.tripId;
    }
    if (req.body.bookingNumber) {
        query.bookingNumber = req.body.bookingNumber;
    }
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    PAYMENTS_COLLECTION.count(countQuery, function(err, count) {
        totalRecords = count;

        PAYMENTS_COLLECTION.find(query, function(paymenterror, payments) {
            if (paymenterror || !payments) {
                json.status = '0';
                json.result = { 'message': 'Payments not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Payments found successfully.', 'payments': payments, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}

function _getAllBookingWithPayments(req, res, next) {
    var query = { tripId: req.body.tripId };
    var totalRecords = 0;

    PAYMENTS_COLLECTION.find(query, 'bookingNumber paymentAmount paymentType', function(paymenterror, payments) {
        if (paymenterror || !payments) {
            json.status = '0';
            json.result = { 'message': 'Payments not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Payments found successfully.', 'payments': payments, 'totalRecords': totalRecords };
            res.send(json);
        }
    });
}