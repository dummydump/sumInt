var model = require('../models/model');
var CHECKS_COLLECTION = model.checks;
var SUPPLIERS_COLLECTION = model.suppliers;
var CRUISELINES_COLLECTION = model.cruise_lines;
var AIRLINES_COLLECTION = model.airlines;
var TOUROPERATOR_COLLECTION = model.tour_operators;
var RECONCILIATION_COLLECTION = model.reconciliation;
var BOOKINGS_COLLECTION = model.bookings; 

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
exports.addNewCheck = _addNewCheck;
exports.getCheckById = _getCheckById;
exports.removeCheckById = _removeCheckById;
exports.updateCheckById = _updateCheckById;
exports.getChecks = _getChecks;

exports.getAllSuppliers = _getAllSuppliers;
exports.addReconciliation = _addReconciliation;
exports.getReconciliation = _getReconciliation;
exports.editReconciliation = _editReconciliation;
/*-------------------------------------------------------*/

/*
TODO: POST To add new cruiseline.
*/
function _addNewCheck(req, res, next) {
	var json = {};
	var checkObject = {
		'checkNumber' : req.body.checkNumber,
		'checkDate' : req.body.checkDate,
		'checkAmount' : req.body.checkAmount,
		'senderId' : req.body.senderId,
		'recipient' : req.body.recipient,
		'reconciledAmount' : req.body.reconciledAmount,
		'summary' : req.body.summary,
		'status' : req.body.status 
	}
	checkObject['reconciledAmount'] = 0;
	checkObject['status'] = "pending";
	if(req.body.reconciledAmount)
	{
		checkObject['reconciledAmount'] = req.body.reconciledAmount; 
	}
	if(req.body.summary)
	{
		checkObject['summary'] = req.body.summary; 
	}
	if(req.body.status)
	{
		checkObject['status'] = req.body.status; 
	}

	if (COMMON_ROUTE.isUndefinedOrNull(checkObject.checkNumber) || COMMON_ROUTE.isUndefinedOrNull(checkObject.checkDate) || COMMON_ROUTE.isUndefinedOrNull(checkObject.checkAmount) ||         COMMON_ROUTE.isUndefinedOrNull(checkObject.senderId) || COMMON_ROUTE.isUndefinedOrNull(checkObject.recipient) ) {
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var check = new CHECKS_COLLECTION(checkObject);

		check.save(function (error, check) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new Check!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New Check added successfully.', '_id': check._id };
				res.send(json);
			}
		});
	}
}




/*
TODO: GET To get check by Id.
*/
function _getCheckById(req, res, next) {
	var checkId = req.params.id;

	if (!COMMON_ROUTE.isValidId(checkId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Check Id!' };
		res.send(json);
	} else {
		CHECKS_COLLECTION.findOne({_id: new ObjectID(checkId)}, function (error, check) {
			
			if (error || !check || check == null) {
				json.status = '0';
				json.result = { 'message': 'Check does not exist!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Check found successfully.', 'check': check };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get checks.
*/

function _getChecks(req, res, next) {
    var query = {};
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var searchBy = (req.body.searchBy) ? req.body.searchBy : '';
    var searchValue = (req.body.searchBy) ? req.body.searchValue : '';
    var skip = (limit * pageCount);
    var totalRecords = 0;
	
	var search = {};
	var StatusQuery = {};
    var SenderQuery = {};
    var CheckNumberQuery = {};
    

    if (req.body.search) {
        search = Object.assign({}, req.body.search);
    }

    if (search) {
        if (search.status) {
			StatusQuery = { status: { $regex: new RegExp("^" + search.status.toLowerCase(), "i") } };
			//console.log(StatusQuery);
        }
        if (search.checkNumber) {
            CheckNumberQuery = { checkNumber : { $regex: new RegExp("^" + search.checkNumber, "i") } };
			//console.log(CheckNumberQuery);
		}
        if (search.sender) {
			// when sender is searched

			var ids = [];
			for(var i=0;i<search.ids.length;i++)
			{
				ids.push({ senderId :search.ids[i]});
			}
			
			
			senderQuery = { $or :ids };
			query = countQuery = Object.assign({},senderQuery,CheckNumberQuery, StatusQuery);
			CHECKS_COLLECTION.count(countQuery, function (err, count) {

				totalRecords = count;
				CHECKS_COLLECTION.find(query, function (error, checks) {
					if (error || !checks || checks==null) {
						json.status = '0';
						json.result = { 'message': 'Checks not found!' };
						res.send(json);
					} else {
						json.status = '1';
						json.result = { 'message': 'Checks found successfully.', 'checks': checks, 'totalRecords': totalRecords};
						res.send(json);       
				
					}
		
				}).skip(skip).limit(limit);
			});
			

		
			return ;
			
		}
        
    }

    query = countQuery = Object.assign({},CheckNumberQuery, StatusQuery);
	
    CHECKS_COLLECTION.count(countQuery, function (err, count) {

        totalRecords = count;
        CHECKS_COLLECTION.find(query, function (error, checks) {
            if (error || !checks || checks==null) {
                json.status = '0';
                json.result = { 'message': 'Checks not found!' };
                res.send(json);
            } else {
				json.status = '1';
                json.result = { 'message': 'Checks found successfully.', 'checks': checks, 'totalRecords': totalRecords};
                res.send(json);       
     
            }

        }).skip(skip).limit(limit);
    });

}

/*
TODO: POST To Remove Check By Id
*/
function _removeCheckById(req, res, next) {
	var checkId = req.params.id;

	if (!COMMON_ROUTE.isValidId(checkId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid Check Id!' };
		res.send(json);
	} else {
		CHECKS_COLLECTION.findOne({ _id: new ObjectID(checkId) }, function (error, getCheck) {
			
			if (error || !getCheck) {
				json.status = '0';
				json.result = { 'message': 'Check not exists!' };
				res.send(json);
			} else {
				CHECKS_COLLECTION.deleteOne({ _id: new ObjectID(checkId) }, function (err, result) {
					if (err) {
						json.status = '0';
						json.result = { 'error': 'Error in deleting Check!' };
						res.send(json);
					} else {
						json.status = '1';
						json.result = { 'message': 'Check deleted successfully.', '_id': checkId };
						res.send(json);
					}
				});
			}
		});
	}
}

/*
TODO: POST To Update Check By Id
*/
function _updateCheckById(req, res, next) {
	var checkId = req.params.id;

	if (!COMMON_ROUTE.isValidId(checkId)) {
		json.status = '0';
		json.result = { 'message': 'Invalid check Id!' };
		res.send(json);
	} else {
		var checkObject = {
			'checkNumber' : req.body.checkNumber,
			'checkDate' : req.body.checkDate,
			'checkAmount' : req.body.checkAmount,
			'senderId' : req.body.senderId,
			'recipient' : req.body.recipient,
		}
		if(req.body.reconciledAmount)
		{
			checkObject['reconciledAmount'] = req.body.reconciledAmount; 
		}
		if(req.body.summary)
		{
			checkObject['summary'] = req.body.summary; 
		}
		if(req.body.status)
		{
			checkObject['status'] = req.body.status; 
		}

		if (COMMON_ROUTE.isUndefinedOrNull(checkObject.checkNumber) || COMMON_ROUTE.isUndefinedOrNull(checkObject.checkDate) || COMMON_ROUTE.isUndefinedOrNull(checkObject.checkAmount) || COMMON_ROUTE.isUndefinedOrNull(checkObject.senderId) || COMMON_ROUTE.isUndefinedOrNull(checkObject.recipient) ) 
		{
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: checkObject
			};

			CHECKS_COLLECTION.findOne({ _id: new ObjectID(checkId) }, function (error, getCheck) {
				
				if (error || !getCheck) {
					json.status = '0';
					json.result = { 'message': 'Check not exists!' };
					res.send(json);
				} else {
					CHECKS_COLLECTION.update({ _id: new ObjectID(checkId) }, query, function (err, result) {
						
						if (err) {
							json.status = '0';
							json.result = { 'error': 'Error in updating check!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Check updated successfully.', '_id': checkId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}



function _getAllSuppliers(req,res,next){
	var query = req.body.data;
	SUPPLIERS_COLLECTION.find({},function(err,data){
		if(err || !data || data==null )
		{
			json.status = '0';
			json.result = { 'message': 'No suppliers found!' };
			res.send(json);
		}
		else
		{
			json.status = '1';
			json.result = { 'message': 'Suppliers found!','suppliers':data };
			res.send(json);
		}
	});
}

function _addReconciliation(req,res,next){
	
	var bookingId = req.body.bookingId;
	var receivedAmount = req.body.receivedAmount;
	var checkId = req.body.checkId;

	if (!COMMON_ROUTE.isValidId(bookingId)) {
        json.status = '0';
        json.result = { 'error': 'Invalid Booking Id!' };
        res.send(json);
    } else {
        BOOKINGS_COLLECTION.findOne({ _id: new ObjectID(bookingId) }, function(bookingerror, getBooking) {
            if (bookingerror || !getBooking) {
                json.status = '0';
                json.result = { 'error': 'Booking not exists!' };
                res.send(json);
            } else {

				if(!getBooking.commisionReceived || getBooking.commisionReceived==null)
				{
					getBooking.commisionReceived = 0;
				}
				
				getBooking.commisionReceived = getBooking.commisionReceived+receivedAmount
				if(getBooking.commisionReceived >= getBooking.commisionEarned){
					getBooking.bookingStatus = "Paid";
				}
				else if((getBooking.commisionReceived ==0))
				{
					getBooking.bookingStatus = "Active";
				}
				else
				{
					getBooking.bookingStatus = "Partial Paid"
				}
				var query = {
					$set: getBooking
				};
				

				BOOKINGS_COLLECTION.update({ _id: new ObjectID(bookingId) }, query, function(error, result) {
					if (error) {
						json.status = '0';
						json.result = { 'error': 'Error in updating booking!' };
						res.send(json);
					} else {
						
						//console.log("booking updated");
						//console.log(checkId);
						CHECKS_COLLECTION.findOne({_id: new ObjectID(checkId)}, function (error, check) {
			
							if (error || !check || check == null) {
								json.status = '0';
								json.result = { 'error': 'Check does not exist!' };
								res.send(json);
							} else {

								console.log("check get");
								if(!check.bookingPayments || check.bookingPayments==null)
								{
									check.bookingPayments = 0;
								}
								
								check.bookingPayments = Number(check.bookingPayments)+ Number(getBooking.commisionEarned);
								check.reconciledAmount += receivedAmount;
								
								if(check.reconciledAmount >= check.checkAmount )
								{
									check.status = "Reconciled";
								}
								else
								{
									check.status = "Pending";
								}

								var checkquery ={
									$set : check
								};
								CHECKS_COLLECTION.update({_id: new ObjectID(checkId)},checkquery, function(chErr,chRes){
									if(chErr){
										json.status = '0';
										json.result = { 'error': 'Error in updating Check!' };
										res.send(json);
									}
									else
									{
										console.log("check updated");

										var reconciliationObject = {
											"checkId": checkId,
											"bookingId" : bookingId,
											"receivedAmount" : receivedAmount
										};
										var reconciliation = new RECONCILIATION_COLLECTION(reconciliationObject);
										reconciliation.save(function(reconErr,reconRes){
											console.log(reconRes);
											if(reconErr)
											{	
												json.status = '0';
												json.result = { 'error': 'Error in updating Check!' };
												res.send(json);
											}
											else
											{
												json.status = '1';
												json.result = { 'message': 'Reconciliation saved!',reconciliationId : reconRes._id };
												res.send(json);

											}
											
										})
									}
								} );

								
							}
						});

						
					}
				});
				
				
            }
        });
    }

}

function _editReconciliation(req,res,next){
	
	var bookingId = req.body.bookingId;
	var receivedAmount = req.body.receivedAmount;
	var checkId = req.body.checkId;
	var reconciliationId = req.body.reconciliationId;
	var del = req.body.delete;

	if (!COMMON_ROUTE.isValidId(bookingId)) {
        json.status = '0';
        json.result = { 'error': 'Invalid Booking Id!' };
        res.send(json);
    } else {
        BOOKINGS_COLLECTION.findOne({ _id: new ObjectID(bookingId) }, function(bookingerror, getBooking) {
            if (bookingerror || !getBooking) {
                json.status = '0';
                json.result = { 'error': 'Booking not exists!' };
                res.send(json);
            } else {
				
				getBooking.commisionReceived = getBooking.commisionReceived+receivedAmount
				
				if(getBooking.commisionReceived >= getBooking.commisionEarned){
					getBooking.bookingStatus = "Paid";
				}
				else if(getBooking.commisionReceived ==0)
				{
					getBooking.bookingStatus = "Active";
				}
				else
				{
					getBooking.bookingStatus = "Partial Paid"
				}
				var query = {
					$set: getBooking
				};
				

				BOOKINGS_COLLECTION.update({ _id: new ObjectID(bookingId) }, query, function(error, result) {
					if (error) {
						json.status = '0';
						json.result = { 'error': 'Error in updating booking!' };
						res.send(json);
					} else {
						
						CHECKS_COLLECTION.findOne({_id: new ObjectID(checkId)}, function (error, check) {
			
							if (error || !check || check == null) {
								json.status = '0';
								json.result = { 'error': 'Check does not exist!' };
								res.send(json);
							} else {
								
								check.reconciledAmount += receivedAmount;
								
								if(check.reconciledAmount >= check.checkAmount )
								{
									check.status = "Reconciled";
								}
								else
								{
									check.status = "Pending";
								}

								var checkquery ={
									$set : check
								};
								CHECKS_COLLECTION.update({_id: new ObjectID(checkId)},checkquery, function(chErr,chRes){
									if(chErr){
										json.status = '0';
										json.result = { 'error': 'Error in updating Check!' };
										res.send(json);
									}
									else
									{
										if(!del)
										{
											var query = {
												$inc: { "receivedAmount": receivedAmount }
											};
	
											RECONCILIATION_COLLECTION.update({ _id: new ObjectID(reconciliationId) },query,function(reconErr,reconRes){
												if(reconErr)
												{	
													json.status = '0';
													json.result = { 'error': 'Error in updating Check!' };
													res.send(json);
												}
												else
												{
													json.status = '1';
													json.result = { 'message': 'Reconciliation updated successfully!',reconciliationId : reconRes._id };
													res.send(json);
												}
												
											})
										}
										else
										{
											RECONCILIATION_COLLECTION.deleteOne({ _id: new ObjectID(reconciliationId) }, function (err, result) {
												if (err) {
													json.status = '0';
													json.result = { 'error': 'Error in deleting Check!' };
													res.send(json);
												} else {
													json.status = '1';
													json.result = { 'message': 'Reconciliation deleted successfully.', '_id': reconciliationId };
													res.send(json);
												}
											});

										}
										
									}
								} );

								
							}
						});

						
					}
				});
				
				
            }
        });
    }

}

function getBookingDetails(bookingId, callback) {
    
    BOOKINGS_COLLECTION.findOne({ _id : new ObjectID(bookingId)}, function (error, booking) {
		console.log(bookingId);
		console.log(booking);
		if (error || !booking) {
            callback(error, {});
        } else {
            callback(null, booking);
        }
    });
}

function _getReconciliation(req,res,next){
	
	var query = {};
	var checkQuery = {};
	var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

	checkQuery = { checkId : req.params.id };
	query = countQuery = Object.assign({},checkQuery);

	RECONCILIATION_COLLECTION.count(countQuery, function (err, count) {

        totalRecords = count;
        RECONCILIATION_COLLECTION.find(query, function (error, results) {
            if (error || !results || results==null) {
                json.status = '0';
                json.result = { 'message': 'Reconciliations not found!' };
                res.send(json);
            } else {

				var array = [];
                var cnt =0;
				results.forEach( (recon,j) => {
                    var bookingId = results[j].bookingId;
                    
                    //if (!COMMON_ROUTE.isArrayEmpty(travelerDetailArray)){    
                    getBookingDetails(bookingId, (err, booking) => {
                        
                            array.push(booking);
							console.log(booking);
							cnt++;
                        if(cnt >= results.length) {
                            json.status = '1';
                            json.result = { 'message': 'Reconciliations found successfully.', 'reconciliations': results, 'totalRecords': totalRecords,'bookings':array };
                            res.send(json);       

                        }
                    });
                });

				
				/*json.status = '1';
                json.result = { 'message': 'Reconciliations found successfully.', 'reconciliations': results, 'totalRecords': totalRecords};
                res.send(json); */      
     
            }

        }).skip(skip).limit(limit);
    });

}