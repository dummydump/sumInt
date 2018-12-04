var model = require('../models/model');
var INVOICES_COLLECTION = model.invoices;
//var PAYMENTS_COLLECTION = model.payments;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');

//var async = require('asyncawait/async');
//var await = require('asyncawait/await');
/*-------------------------------------------------------*/
exports.addInvoice = _addInvoice;
exports.getInvoiceByTripId = _getInvoiceByTripId;
exports.getInvoiceById = _getInvoiceById;
// getinvoice by id
// getinvoice by trip id
// update invoice
/*-------------------------------------------------------*/

/*
TODO: POST To add new invoice.
*/

function checkInvoiceNumber(tripId, newInvoice, callback){
    var query = { tripId: tripId };
    INVOICES_COLLECTION.find(query, function (invoiceError, invoice) {
        if (invoiceError || !invoice || invoice.length == 0) {
            
            var query = { invoiceNumber: newInvoice };
            INVOICES_COLLECTION.find(query, function (invoiceError, invoice) {

                if (invoiceError || !invoice || invoice.length == 0) {
                    callback(true, newInvoice);
                } else {
                    newInvoice = COMMON_ROUTE.getInvoice();
                    checkInvoiceNumber(tripId, newInvoice, callback);
                }
            });
        }
    });
}

function _addInvoice(req, res, next) {
    var json = {};
    var invoiceObject = {
        'tripId': req.body.tripId,
        'amount': req.body.amount,
        'invoiceDate': req.body.invoiceDate,
        'invoiceNumber': req.body.invoiceNumber,
    }
    if (COMMON_ROUTE.isUndefinedOrNull(invoiceObject.tripId)){
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
        return ;
    }

    var query = { tripId: req.body.tripId };
    
    INVOICES_COLLECTION.find(query, function(invoiceError, invoice) {
        if (invoiceError || !invoice || invoice.length == 0) {
            // add new invoice 
            var newInvoice = COMMON_ROUTE.getInvoice();
            checkInvoiceNumber(req.body.tripId, newInvoice, function(isTrue, latestInvoice){
                //console.log('isTrue ' + isTrue);
                //console.log('latestInvoice ' + latestInvoice);
                // make invoice
                invoiceObject.invoiceNumber = latestInvoice;
                var invoice = new INVOICES_COLLECTION(invoiceObject);

                invoice.save(function (error, invoice) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in adding new invoice!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'New invoice added successfully.', '_id': invoice._id };
                        res.send(json);
                        setTimeout(() => {
                        }, 3000);
                    }
                });
            });

        } else {
            json.status = '0';
            json.result = { 'message': 'Invoice already exists.', 'invoice': invoice};
            res.send(json);
        }
    });
            
    
}

/*
TODO: GET To check if invoice is generated.
*/

function _getInvoiceByTripId (req, res, next) {
    var query = { tripId: req.params.id };
    var totalRecords = 0;
    INVOICES_COLLECTION.find(query, function(invoiceError, invoice) {
        if (invoiceError || !invoice || invoice.length == 0) {
            json.status = '0';
            json.result = { 'message': 'Invoice not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Invoice found successfully.', 'invoice': invoice};
            res.send(json);
        }
    });
}

/*
TODO: GET To get invoice by Id.
*/
function _getInvoiceById(req, res, next) {
    var invoiceId = req.params.id;

    if (!COMMON_ROUTE.isValidId(invoiceId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Invoice Id!' };
        res.send(json);
    } else {
        INVOICES_COLLECTION.findOne({ _id: new ObjectID(invoiceId) }, function(invoiceError, invoice) {
            if (invoiceError || !invoice) {
                json.status = '0';
                json.result = { 'message': 'Invoice not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Invoice found successfully.', 'invoice': invoice };
                res.send(json);
            }
        });
    }
}



