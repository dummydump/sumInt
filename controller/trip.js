var model = require('../models/model');
var TRIPS_COLLECTION = model.trips;
var ITINERARY_COLLECTION = model.itineraries;
var USERS_COLLECTION = model.users;
var CLIENTS_COLLECTION = model.clients;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');
var PDF_WRITE_PATH = './public/pdfs/Cupcakes';
var pdf = require('html-pdf');
var fs = require('fs');
var PAYMENTS_COLLECTION = model.payments;
var BOOKINGS_COLLECTION = model.bookings;
var TASKS_COLLECTION = model.tasks;
var DOCUMENTS_COLLECTION = model.documents;
var NOTES_COLLECTION = model.notes;
/*-------------------------------------------------------*/
exports.addTrip = _addTrip;
exports.getTripById = _getTripById;
exports.getTrips = _getTrips;
exports.updateTripById = _updateTripById;
exports.removeTripById = _removeTripById;
exports.getTripsCountByClientId = _getTripsCountByClientId;
exports.sendMail = _sendMail;
exports.downloadPDF = _downloadPDF;
exports.generatePDF = _generatePDF;
exports.sendInvoiceEmail = _sendInvoiceEmail;
exports.getCountInfo = _getCountInfo;
/*-------------------------------------------------------*/

/*
TODO: POST To add new trip.
*/
function _addTrip(req, res, next) {
    var json = {};
    var tripObject = {
        'tripType': req.body.tripType,
        'startDate': req.body.startDate,
        'endDate': req.body.endDate,
        'agent': req.body.agent,
        'tripStatus': req.body.tripStatus,
        'tripDescription': req.body.tripDescription,
        'workspaceExtensions': req.body.workspaceExtensions,
        'travelerDetails': req.body.travelerDetails,
        'primary': req.body.primary
    }

    if (COMMON_ROUTE.isUndefinedOrNull(tripObject.tripType) || COMMON_ROUTE.isUndefinedOrNull(tripObject.startDate) || COMMON_ROUTE.isUndefinedOrNull(tripObject.endDate) || COMMON_ROUTE.isUndefinedOrNull(tripObject.agent.agentId)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var trip = new TRIPS_COLLECTION(tripObject);

        trip.save(function (error, trip) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new trip!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New trip added successfully!', '_id': trip._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Trip By Id
*/
function _updateTripById(req, res, next) {
    var tripId = req.params.id;

    if (!COMMON_ROUTE.isValidId(tripId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Trip Id!' };
        res.send(json);
    } else {
        var tripObject = {
            'tripType': req.body.tripType,
            'startDate': req.body.startDate,
            'endDate': req.body.endDate,
            'agent': req.body.agent,
            'tripStatus': req.body.tripStatus,
            'tripDescription': req.body.tripDescription,
            'workspaceExtensions': req.body.workspaceExtensions,
            'travelerDetails': req.body.travelerDetails,
            'primary': req.body.primary
        }

        if (COMMON_ROUTE.isUndefinedOrNull(tripObject.tripType) || COMMON_ROUTE.isUndefinedOrNull(tripObject.startDate) || COMMON_ROUTE.isUndefinedOrNull(tripObject.endDate)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: tripObject
            };

            TRIPS_COLLECTION.find({ _id: new ObjectID(tripId) }, function (triperror, getTrip) {
                if (triperror || !getTrip) {
                    json.status = '0';
                    json.result = { 'message': 'Trip not exists!' };
                    res.send(json);
                } else {
                    TRIPS_COLLECTION.update({ _id: new ObjectID(tripId) }, query, function (error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating trip!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'The trip details were successfully updated!', '_id': tripId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove Trip By Id
*/
function _removeTripById(req, res, next) {
    var tripId = req.params.id;

    if (!COMMON_ROUTE.isValidId(tripId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Trip Id!' };
        res.send(json);
    } else {
        isPaymentExists(tripId, function (isPaymentFound) {
            if (isPaymentFound) {
                json.status = '0';
                json.result = { 'message': 'Trip can\'t ve deleted. Payment is found for this trip.' };
                res.send(json);
            } else {
                TRIPS_COLLECTION.find({ _id: new ObjectID(tripId) }, function (triperror, getTrip) {
                    if (triperror || !getTrip) {
                        json.status = '0';
                        json.result = { 'message': 'Trip not exists!' };
                        res.send(json);
                    } else {
                        TRIPS_COLLECTION.deleteOne({ _id: new ObjectID(tripId) }, function (error, result) {
                            if (error) {
                                json.status = '0';
                                json.result = { 'error': 'Error in deleting trip!' };
                                res.send(json);
                            } else {
                                removeRelatedDocumentsAsync(tripId);
                                json.status = '1';
                                json.result = { 'message': 'Trip deleted successfully.', '_id': tripId };
                                res.send(json);
                            }
                        });
                    }
                });
            }
        });


    }
}

function isPaymentExists(tripId, callback) {
    PAYMENTS_COLLECTION.find({ tripId: tripId }, function (paymenterror, getPayment) {
        if (paymenterror || !getPayment) {
            callback(false);
        } else {
            if (getPayment.length > 0) {
                callback(true);
            } else {
                callback(false);
            }

        }
    });
}

function removeRelatedDocumentsAsync(tripId) {
    var BOOKINGS_COLLECTION = model.bookings,
        NOTES_COLLECTION = model.notes,
        TASKS_COLLECTION = model.tasks,
        ITINERARY_COLLECTION = model.itineraries,
        TRIP_DETAILS_COLLECTION = model.trip_details,
        ACTIVITIES_COLLECTION = model.trip_activities,
        DOCUMENTS_COLLECTION = model.documents,
        query = { 'tripId': tripId };

    //Remove Bookings
    BOOKINGS_COLLECTION.deleteMany(query, function (error, result) { });

    //Remove Notes
    NOTES_COLLECTION.deleteMany(query, function (error, result) { });

    //Remove Tasks
    TASKS_COLLECTION.deleteMany(query, function (error, result) { });

    //Remove Itineraries
    ITINERARY_COLLECTION.deleteOne(query, function (error, result) { });

    //Remove Trip Details
    TRIP_DETAILS_COLLECTION.deleteMany(query, function (error, result) { });

    //Remove Activities
    ACTIVITIES_COLLECTION.deleteMany(query, function (error, result) { });
    //Remove Settings

    //Remove Documents
    DOCUMENTS_COLLECTION.find(query, function (documenterror, documents) {
        if (documenterror || !documents) {
            // 'message': 'Documents not found!' };
        } else {
            //{ 'message': 'Documents found successfully.', 'documents': documents, 'totalRecords': totalRecords };
            var documentId = ''
            for (var i = 0; i < documents.length; i++) {
                documentId = documents[i]._id;
                DOCUMENTS_COLLECTION.find({ _id: new ObjectID(documentId) }, function (documenterror, getDocument) {
                    if (documenterror || !getDocument) {
                        //'message': 'Document not exists!' };
                    } else {
                        DOCUMENTS_COLLECTION.deleteOne({ _id: new ObjectID(documentId) }, function (error, result) {
                            if (error) {
                                // 'error': 'Error in deleting document!' };
                            } else {
                                deleteFileAsync(getDocument);
                                // 'message': 'Document deleted successfully.', '_id': documentId };
                            }
                        });
                    }
                });
            }
        }
    });
}

function deleteFileAsync(_documentArray) {
    var _document = _documentArray[0];
    var _oldFileName = _document.fileName;
    var path = require('path');
    var dirname = path.resolve(".") + '\\uploads\\' + _document.tripId + '\\' + _oldFileName;

    if (fs.existsSync(dirname)) {
        fs.unlink(dirname);
    }
}

/*
TODO: POST To get trip by Id.
*/
function _getTripById(req, res, next) {
    var tripId = req.params.id;

    if (!COMMON_ROUTE.isValidId(tripId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Task Id!' };
        res.send(json);
    } else {
        var query = { _id: new ObjectID(tripId) };
        TRIPS_COLLECTION.findOne(query, function (triperror, getTrip) {
            if (triperror || !getTrip) {
                json.status = '0';
                json.result = { 'message': 'Trip not exists!' };
                res.send(json);
            } else {
                var travelerDetailArray = getTrip['travelerDetails'];
                var array = [];
                if (!COMMON_ROUTE.isArrayEmpty(travelerDetailArray)) {
                    getTravelerDetails(travelerDetailArray, (err, list) => {

                        list.forEach((travel, i) => {
                            var _result = travelerDetailArray.filter(x=> x.travelerId == travel._id);

                            array.push({
                                "travelerId": travel._id,
                                "travelerType": (_result && _result.length)? _result[0].travelerType : 'secondary',
                                "firstName": travel.firstName,
                                "lastName": travel.lastName,
                                "middleName": travel.middleName,
                                "formattedBirthday": travel.birthDate,
                                "formattedAnniversaryDate": travel.anniversaryDate,
                                "emailCount": (travel.contactDetails) ? travel.contactDetails.length : 0,
                                "contactDetails": travel.contactDetails,
                                "emails": getContactEmail(travel.contactDetails)
                            });

                            if (i + 1 >= list.length) {
                                json.status = '1';
                                json.result = { 'message': 'Trip found successfully.', 'trip': getTrip, 'newTravelerDetails': array };
                                res.send(json);
                            }

                        });
                    });

                } else {
                    json.status = '1';
                    json.result = { 'message': 'Trip found successfully.', 'trip': getTrip, 'newTravelerDetails': [] };
                    res.send(json);
                }
            }
        });
    }
}

function getContactEmail(contactDetails){
    var str = "";
    if(contactDetails && contactDetails.length > 0){
        contactDetails.forEach((element, index) => {
            //console.log('element.detail ', element);
            if(element.detail == 'Email Address'){
                str += element.value;
            }
        });
        return str;
    } else {
        return str;
    }
}

function getTravelerDetails(travelerDetailArray, callback) {
    
    var listOfIds = travelerDetailArray.map(a => ObjectID(a.travelerId));
    
    var listOfObjectIds = [];
    listOfIds.forEach(function (id) {
        listOfObjectIds.push(ObjectID(id));
        //console.log("id " +ObjectID(id));
    }, this);

    var query = {
        "_id": { "$in": listOfObjectIds }
    }

    CLIENTS_COLLECTION.find(query, { firstName: 1, middleName: 1, lastName: 1, birthDate: 1, anniversaryDate: 1, contactDetails: 1 }, function (clientrror, clients) {
        if (clientrror || !clients) {
            callback(clientrror, []);
        } else {
            callback(null, clients);
        }
    });
}

/*
TODO: POST To get trips.
*/

function _getTrips(req, res, next) {
    var query = {};
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var searchBy = (req.body.searchBy) ? req.body.searchBy : '';
    var searchValue = (req.body.searchBy) ? req.body.searchValue : '';
    var skip = (limit * pageCount);
    var totalRecords = 0;
    var search = {};
    var tripTypeQuery = {};
    var primaryQuery = {};
    var agentQuery = {};
    var startDateQuery = {};
    var endDateQuery = {};
    var leadGuestQuery = {};

    if (req.body.search) {
        search = Object.assign({}, req.body.search);
    }

    if (search) {
        if (search.tripType) {
            tripTypeQuery = { tripType: { $regex: new RegExp("^" + search.tripType.toLowerCase(), "i") } };
        }
        if (search.primary) {
            primaryQuery = { 'primary.name': { $regex: new RegExp("^" + search.primary.toLowerCase(), "i") } };
        }
        if (search.agent) {
            agentQuery = { $or: [{ "agent.agentFirstName": { $regex: new RegExp("^" + search.agent.toLowerCase(), "i") } }, { "agent.agentLastName": { $regex: new RegExp("^" + search.agent.toLowerCase(), "i") } }] };
        }
        if (search.startDate) {
            startDateQuery = { startDate: { $regex: new RegExp("^" + search.startDate.toLowerCase(), "i") } };
        }
        if (search.endDate) {
            endDateQuery = { endDate: { $regex: new RegExp("^" + search.endDate.toLowerCase(), "i") } };
        }
        if (search.leadGuest) {
            leadGuestQuery = { $or: [{ travelerDetails: { $elemMatch: { "traveler.firstName": { $regex: new RegExp("^" + search.leadGuest.toLowerCase(), "i") } } } }, { travelerDetails: { $elemMatch: { "traveler.lastName": { $regex: new RegExp("^" + search.leadGuest.toLowerCase(), "i") } } } }] };
        }
    }

    var agentQueryNew = {};

    if (req.body.roleName == 'Agent' || req.body.roleName == 'Assistant') {
        agentQueryNew = { "agent.agentId": req.body.userId };
    }

    query = countQuery = Object.assign({}, tripTypeQuery, primaryQuery, agentQuery, startDateQuery, endDateQuery, leadGuestQuery, agentQueryNew);

    TRIPS_COLLECTION.count(countQuery, function (err, count) {

        totalRecords = count;
        TRIPS_COLLECTION.find(query, function (triperror, trips) {
            if (triperror || !trips) {
                json.status = '0';
                json.result = { 'message': 'Trips not found!' };
                res.send(json);
            } else {

                // change here
                var array = [];
                var cnt =0;
                if(trips.length > 0){
                    trips.forEach( (getTrip,j) => {
                        var travelerDetailArray = getTrip['travelerDetails'];
                        
                        //if (!COMMON_ROUTE.isArrayEmpty(travelerDetailArray)){    
                        getTravelerDetails(travelerDetailArray, (err, list) => {
                            list.forEach((travel, i) => {
                                var _result = travelerDetailArray.filter(x=> x.travelerId == travel._id);
                                array.push({
                                    "travelerId": travel._id,
                                    "travelerType": (_result && _result.length)? _result[0].travelerType : 'secondary',
                                    "firstName": travel.firstName,
                                    "lastName": travel.lastName,
                                    "middleName": travel.middleName,
                                    "formattedBirthday": travel.birthDate,
                                    "formattedAnniversaryDate": travel.anniversaryDate,
                                    "emailCount": (travel.contactDetails) ? travel.contactDetails.length : 0,
                                    "contactDetails": travel.contactDetails,
                                    "emails": getContactEmail(travel.contactDetails)
                                });
                            });

                            cnt++;

                            if(cnt >= trips.length) {
                                json.status = '1';
                                json.result = { 'message': 'Trips found successfully.', 'trips': trips, 'totalRecords': totalRecords,'travelerDetails':array };
                                res.send(json);       

                            }
                        });
                    });     
                } else {
                    json.status = '1';
                    json.result = { 'message': 'Trips found successfully.', 'trips': trips, 'totalRecords': totalRecords,'travelerDetails':array };
                    res.send(json); 
                }
            }

        }).skip(skip).limit(limit);
    });

}


/*
TODO: POST To get tripCount by ClientID.
*/
function _getTripsCountByClientId(req, res, next) {
    var query = {};
    var countQuery = {};
    var totalTrips = 0;
    var clientId = req.params.clientId;

    if (!COMMON_ROUTE.isValidId(clientId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Client Id!' };
        res.send(json);
    } else {
        query = countQuery = { travelerDetails: { $elemMatch: { travelerId: clientId } } };

        TRIPS_COLLECTION.count(countQuery, function (err, count) {
            totalTrips = count;

            TRIPS_COLLECTION.find(query, function (triperror, trips) {
                if (triperror || !trips) {
                    json.status = '0';
                    json.result = { 'message': 'Trips not found!' };
                    res.send(json);
                } else {
                    json.status = '1';
                    json.result = { 'message': 'Trips found successfully.', 'travelerId': clientId, 'trips': trips, 'totalTrips': totalTrips };
                    res.send(json);
                }
            });
        });
    }
}

/*
TODO: POST to send mail.
*/
function _sendMail(req, res, next) {

    var a = [];
    req.body.sendTo.forEach((element, index) => {
        if (element['mailId'] != "") {
            a.push(element['mailId']);
        }
        if ((index + 1) == (req.body.sendTo).length) {
            a.join(", ");
        }
    });


    var data = {
        'sendTo': a,
        'subject': req.body.subject,
        'body': req.body.body,
        'htmlBody': req.body.htmlBody,
        'itineraryId': req.body.itineraryId,
        'itineraryFieldsTimeArr': req.body.itineraryFieldsTimeArr,
        'landmarkDetailInfo': req.body.landmarkDetailInfo,
        'link': req.body.link,
        'html': req.body.html,
        'images': req.body.images
    }

    var pdfHtml = req.body.pdfHtml;
    var pdfName = req.body.pdfName;

    if (!COMMON_ROUTE.isValidId(data.itineraryId)) {
        json.status = '0';
        json.result = { 'message': 'ItineraryId is valid !' };
        res.send(json);
    } else {
        ITINERARY_COLLECTION.findOne({ _id: new ObjectID(data.itineraryId) }, function (triperror, getItinerary) {
            if (triperror || (!getItinerary || !getItinerary)) {
                json.status = '0';
                json.result = { 'message': 'Trip not exists!' };
                res.send(json);
            } else {
                if (!COMMON_ROUTE.isValidId(getItinerary.clientId)) {
                    json.status = '0';
                    json.result = { 'message': 'ClientId is valid !' };
                    res.send(json);
                } else {

                    if (!getItinerary || !COMMON_ROUTE.isValidId(getItinerary.clientId)) {
                        json.status = '0';
                        json.result = { 'error': 'Client not exists!' };
                        res.send(json);
                    } else {
                        CLIENTS_COLLECTION.findOne({ _id: new ObjectID(getItinerary.clientId) }, function (clientrror, getClient) {
                            if (clientrror || (!getClient || !getItinerary)) {
                                json.status = '0';
                                json.result = { 'error': 'Client not exists!' };
                                res.send(json);
                            } else {
                                var _HTML = "<span>Dear " + getClient.firstName + "</span>,<br><br>";
                                _HTML += "<span>Here is the <a href='" + data.link + "'>link </a>to your itinerary details.</span><br><br>";
                                _HTML += "<span>Thanks</span><br><span>Team Cup Cakes</span><br><br>";

                                _generatePDF(pdfHtml, pdfName, function (pdfErr, pdfRes) {

                                    if (pdfErr) {
                                        json.status = '0';
                                        json.result = { 'error': 'Fail to generate pdf for email attachment.' + pdfErr };
                                        res.send(json);
                                    } else {

                                        fs.readFile(pdfRes.filename, 'utf8', function (err, file) {
                                            if (err) {
                                                json.status = '0';
                                                json.result = { 'error': 'Fail to send mail.' + err };
                                                res.send(json);
                                            } else {
                                                data.HTML = _HTML;
                                                data.attachments = [{
                                                    'filename': pdfName,
                                                    'path': pdfRes.filename,
                                                    "contentType": 'application/pdf'
                                                }];

                                                COMMON_ROUTE.sendMail(data, function (err, result) {
                                                    fs.unlink(pdfRes.filename);
                                                    if (err) {
                                                        json.status = '0';
                                                        json.result = { 'error': 'Fail to send mail.' + err };
                                                        res.send(json);
                                                    } else {
                                                        json.status = '1';
                                                        json.result = { 'message': 'Mail sent successfully.' };
                                                        res.send(json);
                                                    }
                                                });
                                            }

                                        });

                                    }
                                });

                            }
                        });
                    }
                }

            }
        });
    }
}


function concateString(str1, str2) {

    var res = str2 + ',' + str1;

    return res;

}

function _downloadPDF(req, res, next) {
    var pdfHtml = req.body.pdfHtml;
    var pdfName = req.body.pdfName;

    _generatePDF(pdfHtml, pdfName, function (pdfErr, pdfRes) {
        if (pdfErr) {
            json.status = '0';
            json.result = { 'error': 'Fail to generate PDF.' + pdfErr };
            res.send(json);
        } else {
            var data = fs.readFileSync(pdfRes.filename);
            fs.unlink(pdfRes.filename);
            res.contentType("application/octet-stream");
            res.send(data);
        }
    });
}

function _sendInvoiceEmail(req, res, next) {
    var pdfHtml = req.body.pdfHtml;
    var pdfName = req.body.pdfName;
    var agentFullName = req.body.agentFullName;
    var link = req.body.link;
    var a = [];
    req.body.sendTo.forEach((element, index) => {
        if (element['mailId'] != "" && element['mailId'] != null) {
            a.push(element['mailId']);
        }
        if ((index + 1) == (req.body.sendTo).length) {
            a.join(", ");
        }
    });
    var data = {};
    var _HTML = "<span>Dear " + agentFullName + "</span>,<br><br>";
    _HTML += "<span>Here is the <a href='" + link + "'>link </a>to your invoice details.</span><br><br>";
    _HTML += "<span>Thanks</span><br><span>Team Cup Cakes</span><br><br>";

    _generatePDF(pdfHtml, pdfName, function (pdfErr, pdfRes) {

        if (pdfErr) {
            json.status = '0';
            json.result = { 'error': 'Fail to generate pdf for email attachment.' + pdfErr };
            res.send(json);
        } else {

            fs.readFile(pdfRes.filename, 'utf8', function (err, file) {
                if (err) {
                    json.status = '0';
                    json.result = { 'error': 'Fail to send mail.' + err };
                    res.send(json);
                } else {
                    data.HTML = _HTML;
                    data.sendTo = a;
                    data.attachments = [{
                        'filename': pdfName,
                        'path': pdfRes.filename,
                        "contentType": 'application/pdf'
                    }];

                    COMMON_ROUTE.sendMail(data, function (err, result) {
                        fs.unlink(pdfRes.filename);
                        if (err) {
                            json.status = '0';
                            json.result = { 'error': 'Fail to send mail.' + err };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Mail sent successfully.' };
                            res.send(json);
                        }
                    });
                }
            });
        }
    });
}

function _generatePDF(pdfHtml, pdfName, callback) {
    // var pdfName = new Date().getTime() + '.pdf';
    var pdfFilePath = PDF_WRITE_PATH + pdfName;

    var options = {
        format: 'Letter',
        "header": {
            "height": "5mm"
        },
        "footer": {
            "height": "10mm"
        }
    };

    pdf.create(pdfHtml, options).toFile(pdfFilePath, function (err, pdfRes) {
        if (err) {
            callback(err);
        } else {
            callback(null, pdfRes);
        }
    });
}

function _downloadPDF(req, res, next) {
    var pdfHtml = req.body.pdfHtml;
    var pdfName = req.body.pdfName;

    _generatePDF(pdfHtml, pdfName, function (pdfErr, pdfRes) {
        if (pdfErr) {
            json.status = '0';
            json.result = { 'error': 'Fail to generate PDF.' + pdfErr };
            res.send(json);
        } else {
            var data = fs.readFileSync(pdfRes.filename);
            res.contentType("application/octet-stream");
            res.send(data);
        }
    });
}

function _generatePDF(pdfHtml, pdfName, callback) {
    // var pdfName = new Date().getTime() + '.pdf';
    var pdfFilePath = PDF_WRITE_PATH + pdfName;

    var options = {
        format: 'Letter',
        "header": {
            "height": "5mm"
        },
        "footer": {
            "height": "10mm"
        }
    };

    pdf.create(pdfHtml, options).toFile(pdfFilePath, function (err, pdfRes) {
        if (err) {
            callback(err);
        } else {
            callback(null, pdfRes);
        }
    });
}

function _getCountInfo(req,res,next)
{
    var query= { tripId : req.params.id };

    BOOKINGS_COLLECTION.count(query, function(err, bookingCount) {

        if (err) {
            json.status = '0';
            json.result = { 'message': 'Error in finding Bookings!' };
            res.send(json);
        } else {
            TASKS_COLLECTION.count(query,function(err,taskCount){
                if (err) {
                    json.status = '0';
                    json.result = { 'message': 'Error in finding Tasks!' };
                    res.send(json);
                }
                else
                {
                    DOCUMENTS_COLLECTION.count(query,function(err,docCount){
                        if(err){
                            json.status = '0';
                            json.result = { 'message': 'Error in finding Documents!' };
                            res.send(json);

                        }else
                        {
                            NOTES_COLLECTION.count(query,function(err,noteCount){
                                if(err)
                                {
                                    json.status = '0';
                                    json.result = { 'message': 'Error in finding Notes!' };
                                    res.send(json);
                                }
                                else
                                {
                                    json.status = '1';
                                    json.result = { 'message': 'Counts found successfully.', 'bookingCount': bookingCount, 'docCount': docCount,'taskCount':taskCount, 'noteCount':noteCount };
                                    res.send(json);
                                }
                            });
                        }
                    });
                }        
            });
            
        }

    });
    
}



