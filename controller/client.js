var model = require('../models/model');
var CLIENTS_COLLECTION = model.clients;
var TRIPS_COLLECTION = model.trips;
var RELATIVES_COLLECTION = model.relatives;
var WORKSPACE_EXTENSION_COLLECTION = model.workspace_extensions;
var EMAIL_AUTOMATION_COLLECTION = model.email_automation;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var async = require('async');

var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');

/*-------------------------------------------------------*/
exports.addClient = _addClient;
exports.getClientById = _getClientById;
exports.getClients = _getClients;
exports.updateClientById = _updateClientById;
exports.removeClientById = _removeClientById;
exports.getClientToken = _getClientToken;
exports.importClient = _importClient;
exports.getAllClients = _getAllClients;
exports.downloadFile = _downloadFile;
exports.increaseTripCounterByClientId = _increaseTripCounterByClientId;
exports.decreaseTripCountersByClientIds = _decreaseTripCountersByClientIds;
/*-------------------------------------------------------*/

/*
TODO: POST To add new client.
*/
function _addClient(req, res, next) {
    var json = {};

    if(req.body.telephone)
    {
        req.body['contactDetails'] = [];
        req.body.contactDetails.push({
            "detail": "Telephone",
            "detailType": "Mobile",
            "value": req.body.telephone
        });
    }
    
    var clientObject = {
        'firstName': req.body.firstName,
        'middleName': req.body.middleName,
        'lastName': req.body.lastName,
        'nickName': req.body.nickName,
        'birthDate': req.body.birthDate,
        'anniversaryDate': req.body.anniversaryDate,
        'agent': req.body.agent,
        'gender': req.body.gender,
        'mapAddress': req.body.mapAddress,
        'latitude': req.body.latitude,
        'longitude': req.body.longitude,
        'address1': req.body.address1,
        'address2': req.body.address2,
        'city': req.body.city,
        'state': req.body.state,
        'zipcode': req.body.zipcode,
        'clientTags': req.body.clientTags,
        'contactDetails': req.body.contactDetails,
        'additionalNotes': req.body.additionalNotes,
        'passportDetails': req.body.passportDetails,
        'workspaceExtensions': req.body.workspaceExtensions,
        'clientUniqueId': COMMON_ROUTE.generateRandomNumber(6)
    }

    if (COMMON_ROUTE.isUndefinedOrNull(clientObject.firstName) || COMMON_ROUTE.isUndefinedOrNull(clientObject.lastName)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var client = new CLIENTS_COLLECTION(clientObject);

        client.save(function (error, client) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new client!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New client added successfully.', '_id': client._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Client By Id
*/
function _updateClientById(req, res, next) {
    var clientId = req.params.id;
    var score = 0;

    if (!COMMON_ROUTE.isValidId(clientId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Client Id!' };
        res.send(json);
    } else {

        var dob = (req.body.birthDate) ? COMMON_ROUTE.getDateYYYYMMDD(req.body.birthDate) : "";

        var clientObject = {
            'firstName': req.body.firstName,
            'middleName': req.body.middleName,
            'lastName': req.body.lastName,
            'nickName': req.body.nickName,
            'birthDate': req.body.birthDate,
            'anniversaryDate': req.body.anniversaryDate,
            'agent': req.body.agent,
            'gender': req.body.gender,
            'mapAddress': req.body.mapAddress,
            'latitude': req.body.latitude,
            'longitude': req.body.longitude,
            'address1': req.body.address1,
            'address2': req.body.address2,
            'city': req.body.city,
            'state': req.body.state,
            'zipcode': req.body.zipcode,
            'clientTags': req.body.clientTags,
            'contactDetails': req.body.contactDetails,
            'additionalNotes': req.body.additionalNotes,
            'workspaceExtensions': req.body.workspaceExtensions,
            'passportDetails': req.body.passportDetails
        }

        var arrayLength = req.body.contactDetails.length;
        var pos = 0;
        if (req.body.editContactIndex == 0) { //arrayLength -1;
            pos = arrayLength;
        } else {
            pos = req.body.editContactIndex;
        }

        if (COMMON_ROUTE.isUndefinedOrNull(clientObject.firstName) || COMMON_ROUTE.isUndefinedOrNull(clientObject.lastName) || COMMON_ROUTE.isUndefinedOrNull(clientId)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: clientObject
            };

            CLIENTS_COLLECTION.findOne({ _id: new ObjectID(clientId) }, function (clienterror, getClient) {
                if (clienterror || !getClient) {
                    json.status = '0';
                    json.result = { 'message': 'Client not exists!' };
                    res.send(json);

                } else if (req.body.contactDetails < getClient.contactDetails) {
                    CLIENTS_COLLECTION.update({ _id: new ObjectID(clientId) }, query, function (error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating client!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Client updated successfully.', '_id': clientId };
                            res.send(json);
                        }
                    });
                } else if (pos == 0 || arrayLength > 0) {
                    CLIENTS_COLLECTION.update({ _id: new ObjectID(clientId) }, query, function (error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating client!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Client updated successfully.', '_id': clientId };
                            res.send(json);
                        }
                    });
                } else {
                    async.forEach(getClient.contactDetails, function (contact, callback) {
                        if (req.body.contactDetails[(pos - 1)].value == contact.value) {
                            score++;
                        }
                        callback();

                    }, function (err) {
                        if (score == 0) {
                            CLIENTS_COLLECTION.update({ _id: new ObjectID(clientId) }, query, function (error, result) {
                                if (error) {
                                    json.status = '0';
                                    json.result = { 'error': 'Error in updating client!' };
                                    res.send(json);
                                } else {
                                    json.status = '1';
                                    json.result = { 'message': 'Client updated successfully.', '_id': clientId };
                                    res.send(json);
                                }
                            });
                        } else {
                            json.status = '0';
                            json.result = { 'error': 'This contact detail already exists!' };
                            res.send(json);
                        }
                    });

                }
            });
        }
    }
}

/*
TODO: POST To Remove Client By Id
*/
function _removeClientById(req, res, next) {
    var clientId = req.params.id;

    if (!COMMON_ROUTE.isValidId(clientId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Client Id!' };
        res.send(json);
    } else {
        CLIENTS_COLLECTION.find({ _id: new ObjectID(clientId) }, function (clienterror, getClient) {
            if (clienterror || !getClient) {
                json.status = '0';
                json.result = { 'message': 'Client not exists!' };
                res.send(json);
            } else {
                CLIENTS_COLLECTION.deleteOne({ _id: new ObjectID(clientId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting client!' };
                        res.send(json);
                    } else {
                        var removeRelativeQuery = {
                            $or: [
                                { clientId: clientId },
                                { relativeClientId: clientId }
                            ]
                        };

                        RELATIVES_COLLECTION.remove(removeRelativeQuery, function (error, result) {
                            if (error) {
                                json.status = '0';
                                json.result = { 'error': 'Error in deleting relatives!' };
                                res.send(json);
                            } else {
                                json.status = '1';
                                json.result = { 'message': 'Client deleted successfully.', '_id': clientId };
                                res.send(json);
                            }
                        });
                    }
                });
            }
        });
    }
}

/*
TODO: POST To get client by Id.
*/
function _getClientById(req, res, next) {
    var clientId = req.params.id;

    var idQuery = { _id: new ObjectID(clientId) };
    var agentQueryNew = {};

    if (req.body.roleName == 'Agent' || req.body.roleName == 'Assistant') {
        agentQueryNew = { "agent.agentId": req.body.userId };
    }

    var query = Object.assign({}, idQuery, agentQueryNew);

    if (!COMMON_ROUTE.isValidId(clientId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Client Id!' };
        res.send(json);
    } else {
        CLIENTS_COLLECTION.findOne(query, function (clienterror, getClient) {
            if (clienterror || !getClient) {
                json.status = '0';
                json.result = { 'message': 'Client not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Client found successfully.', 'client': getClient };
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To Get Client Token
*/
function _getClientToken(req, res, next) {
    var email = req.body.email;
    var query = { "email": email };
    CLIENTS_COLLECTION.findOne(query, function (clienterror, getClient) {
        if (clienterror || COMMON_ROUTE.isUndefinedOrNull(getClient)) {
            json.status = '0';
            json.result = { 'message': 'Clients Not Found!' + clienterror };
            res.send(json);
        } else {
            var token = jwt.sign(getClient, CONSTANT.superSecret, {
                expiresIn: 86400 // expires in 24 hours
            });
            json.status = '1';
            json.result = { "client": getClient, "token": 'Basic ' + token };
            res.send(json);
        }
    });
}

/*
METHOD: getClients
DEFINATION: To Get list of clients
TYPE: POST
PARAMS: req, res, next
RETURN VALUE: Array of clients
*/
function _getClients(req, res, next) {
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    //	var searchBy = (req.body.searchBy)? req.body.searchBy : '';
    //	var searchValue = (req.body.searchBy)? req.body.searchValue : '';
    var skip = (limit * pageCount);
    var totalRecords = 0;
    var query = {};
    var countQuery = {};
    var countQuery2 = {};
    var firstNameQuery = {};
    var lastNameQuery = {};
    var emailQuery = {};
    var telephoneQuery = {};
    var addressQuery = {};
    var agentQuery = {};
    var agentQueryNew = {};
    var search = {};
    var countQuery = {};
    var totalTrips = 0;
    var clientId = 0;
    if (req.body.search) {
        search = Object.assign({}, req.body.search)
    }

    if (search) {
        if (search.firstName) {
            firstNameQuery = { firstName: { $regex: new RegExp("^" + search.firstName.toLowerCase(), "i") } };
        }
        if (search.lastName) {
            lastNameQuery = { lastName: { $regex: new RegExp("^" + search.lastName.toLowerCase(), "i") } };
        }
        if (search.address) {
            addressQuery = { $or: [{ 'address1': new RegExp(search.address, 'i') }, { 'address2': new RegExp(search.address, 'i') }, { 'zipcode': new RegExp(search.address, 'i') }, { 'city': new RegExp(search.address, 'i') }, { 'state': new RegExp(search.address, 'i') }] };
        }
        if (search.telephone) {
            var tel = search.telephone;
            tel = tel.replace("(", "\\(").replace(")", "\\)");
            telephoneQuery = { contactDetails: { $elemMatch: { value: { $regex: new RegExp("^" + tel, "i") } } } }
        }
        if (search.email) {
            emailQuery = { contactDetails: { $elemMatch: { value: { $regex: new RegExp("^" + search.email.toLowerCase(), "i") } } } };
        }
        if (search.agent) {
            agentQuery = { $or: [{ "agent.agentFirstName": { $regex: new RegExp("^" + search.agent.toLowerCase(), "i") } }, { "agent.agentLastName": { $regex: new RegExp("^" + search.agent.toLowerCase(), "i") } }] };
        }
    }

    if (req.body.roleName == 'Agent' || req.body.roleName == 'Assistant') {
        agentQueryNew = { "agent.agentId": req.body.userId };
    }

    var query = countQuery = Object.assign({}, firstNameQuery, emailQuery, addressQuery, telephoneQuery, lastNameQuery, agentQuery, agentQueryNew);

    console.log('query ', JSON.stringify(query));

    CLIENTS_COLLECTION.count(countQuery, function (err, count) {
        totalRecords = count;
        CLIENTS_COLLECTION.find(query, function (clienterror, clients) {
            if (clienterror || !clients) {
                json.status = '0';
                json.result = { 'message': 'Clients not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Clients found successfully.', 'clients': clients, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });

}
/*TODO: increaseTripCounterByClientId*/
function _increaseTripCounterByClientId(req, res, next) {
    var query = {};
    var clientId = req.params.id;

    if (!COMMON_ROUTE.isValidId(clientId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Client Id!' };
        res.send(json);
    } else {
        query = {
            $inc: { tripCounter: 1 }
        };
        CLIENTS_COLLECTION.update({ _id: new ObjectID(clientId) }, query, function (error, result) {
            if (error) {
                json.status = '0';
                json.result = { 'message': 'Error Occured While Increasing trip' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'The TripCount has been increased', '_id': clientId };
                res.send(json);
            }
        });
    }
}

/*TODO: decreaseTripCounterByClientId*/
function _decreaseTripCountersByClientIds(req, res, next) {
    var travellerIdArray = req.body.travellerIds;
    var query = {
        $inc: { tripCounter: -1 }
    };
    if (!COMMON_ROUTE.isArrayEmpty(travellerIdArray)) {
        getTravelerDetails(travellerIdArray, (err, list) => {

            list.forEach((travel, i) => {
                if (travel.tripCounter != 0) {
                    CLIENTS_COLLECTION.update({ _id: new ObjectID(travel._id) }, query, function (error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'message': 'Error Occured While Decreasing trip' };
                            res.send(json);
                        }
                    });
                }
                if (i + 1 >= list.length) {
                    json.status = '1';
                    json.result = { 'message': 'Trip Couners adjusted.' };
                    res.send(json);
                }

            });
        });

    } else {
        json.status = '0';
        json.result = { 'message': 'empty array found', 'found': req.param.travellerIds };
        res.send(json);
    }
}

function getTravelerDetails(travelerDetailArray, callback) {

    var query = {
        "_id": { "$in": travelerDetailArray }
    }

    CLIENTS_COLLECTION.find(query, function (clientrror, clients) {
        if (clientrror || !clients) {
            callback(clientrror, []);
        } else {
            callback(null, clients);
        }
    });
}


/*
TODO:Get All The Clients
*/
function _getAllClients(req, res, next) {
    var query = {};
    var totalRecords = 0;

    var agentQuery = {};
    var search = req.body.search; 
    // firstNameQuery = { firstName: "/.*" + search.toLowerCase() + ".*/" };

    // lastNameQuery = { lastName: search.toLowerCase() };
    firstNameQuery = { firstName: { $regex: new RegExp("^" + search.toLowerCase(), "i") } };

    lastNameQuery = { lastName: { $regex: new RegExp("^" + search.toLowerCase(), "i") } };

    var searchQuery =  { $or: [firstNameQuery,lastNameQuery]}
    

    // if (req.body.roleName == 'Agent' || req.body.roleName == 'Assistant') {
        agentQuery = { "agent.agentId": req.body.userId };
    // }
    var query  = Object.assign({}, agentQuery, searchQuery);
    
    CLIENTS_COLLECTION.find(query, { firstName: 1, lastName: 1 }, function (clienterror, clients) {
        if (clienterror || !clients) {
            json.status = '0';
            json.result = { 'message': 'Clients not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Clients found successfully.', 'clients': clients };
            res.send(json);
        }
    }).limit(50);
}

function insertWorkSpaceExtension(clientObject, callback) {


    var workspaceExtensionObj = new WORKSPACE_EXTENSION_COLLECTION({
        clientId: clientObject._id,
        title: 'Birthday-Anniversary Extension ',
        type: 'Email',
        emailCounter: 1
    });

    workspaceExtensionObj.save(function (extError, extRes) {
        if (extError) {
            callback(extError, extRes);
        } else {
            var emailAutomationObj = new EMAIL_AUTOMATION_COLLECTION({
                workspaceExtensionId: extRes._id,
                templateId: "5ad71c801a1d0e31a454b90d",
                sendDate: clientObject.birthDate,
                sendTime: "00:00",
                placeholders: {}
            });

            emailAutomationObj.save(function (emailError, emailRes) {
                if (emailError) {
                    callback(emailError, emailRes);
                } else {
                    callback(null, emailRes);
                }
            });
        }
    });

}

function insertClientFromImport(_email, client, insertedEmails, callback) {
    var _agentId = client.agent.agentId;
    //var _phoneNumber = client["telephone"];
    if (!COMMON_ROUTE.isValidEmail(_email.trim())) {
        callback('Email id not valid', null);
        return;
    }
    // Allowing Import of Client if:
    // The Client is Not added by the Current Agent(Who uploaded Excel File)
    CLIENTS_COLLECTION.find({ $and: [{ contactDetails: { $elemMatch: { value: _email } } }, { "agent.agentId": _agentId }] }, function (err, clientResult) {
        if ((insertedEmails.indexOf(_email) <= -1) && (err || !clientResult || clientResult.length <= 0)) {
            var clientObject = client;

            var clientCol = new CLIENTS_COLLECTION(clientObject);

            clientCol.save(function (error, clientRes) {
                if (error) {
                    callback(err, clientRes);
                } else {
                    if (clientObject.birthDate) {
                        insertWorkSpaceExtension(clientRes, function (extensionErr, extensionRes) {
                            if (extensionErr) {
                                callback(extensionErr, extensionRes);
                            } else {
                                callback(null, clientRes);
                            }
                        });
                    }
                    callback(null, clientRes);
                }
            });
        } else {
            callback('Client already exists', null);
        }
    });
}

function _importClient(req, res, next) {
    var notSavedCount = 0;
    var notSavedArray = [];
    var totalSavedCount = 0;
    var file = req.files.file.path;
    var count = 0;

    var agentId = req.body.agentId;
    var agentFirstName = req.body.agentFirstName;
    var agentLastName = req.body.agentLastName;
    var ext = req.body.ext;

    COMMON_ROUTE.ExcelCSVToJson(file, ext, function (err, results) {
        if (err) {
            json.status = '0';
            json.result = { 'message': 'Error while reading file : ' + err, 'notSavedCount': notSavedCount, 'notSaved': notSavedArray, 'totalSavedCount': totalSavedCount };
            res.send(json);
        } else {
            var columnPositionErrors = checkImportFileFormat(results[0]);
            if (columnPositionErrors !== '') {
                json.status = '0';
                json.result = { 'message': columnPositionErrors, 'errorType': "COLUMN_POSITION" };
                res.send(json);
                return;
            }
            if (!results || results.length == 1) {
                json.status = '0';
                json.result = { 'message': 'File does not contain more data', 'notSavedCount': notSavedCount, 'notSaved': notSavedArray, 'totalSavedCount': totalSavedCount };
                res.send(json);
            } else {
                removeDuplicate(results, function (data, cnt, sMailIds) {
                    // notSavedArray = sMailIds;
                    // totalSavedCount = cnt;
                    var insertedEmails = [];
                    results = data;
                    async.each(results,
                        // 2nd param is the function that each item is passed to
                        function (client, callback) {
                            var _contactDetails
                            var _email = client[6];
                            var _contactTelephone = client[5];
                            _contactTelephone = _contactTelephone != '' ? (_contactTelephone.match(/\d/g) != null ? _contactTelephone.match(/\d/g).join("") : '') : '';
                            if (_contactTelephone != '') {
                                _contactDetails = (_email != '' && COMMON_ROUTE.isValidEmail(_email)) ? [{ 'detail': 'Email Address', 'detailType': 'Home', 'value': _email }, { 'detail': 'Telephone', 'detailType': 'Home', 'value': _contactTelephone }] : [];
                            } else {
                                _contactDetails = (_email != '' && COMMON_ROUTE.isValidEmail(_email)) ? [{ 'detail': 'Email Address', 'detailType': 'Home', 'value': _email }] : [];
                            }
                            var _telephone = client[4];
                            var _phoneNumber = _telephone != '' ? (_telephone.match(/\d/g) != null ? _telephone.match(/\d/g).join("") : '') : '';
                            var _gender = client[7];
                            if (_gender != "" && (_gender.toLowerCase() == "male" || _gender.toLowerCase() == "m")) {
                                _gender = "male"
                            }
                            else if (_gender != "" && (_gender.toLowerCase() == "female" || _gender.toLowerCase() == "f")) {
                                _gender = "female"
                            }
                            else {
                                _gender = "";
                            }

                            var _DOB = (client[3]) ? COMMON_ROUTE.getDateYYYYMMDD(client[3]) : "";

                            var clientObject = {
                                'firstName': client[0],
                                'middleName': client[1],
                                'lastName': client[2],
                                'nickName': "",
                                'birthDate': _DOB,
                                'anniversaryDate': "",
                                'agent': {
                                    "agentId": agentId,
                                    "agentFirstName": agentFirstName,
                                    "agentLastName": agentLastName
                                },
                                'gender': _gender,
                                'mapAddress': "",
                                'latitude': "",
                                'longitude': "",
                                'address1': client[8],
                                'address2': client[9],
                                'city': client[10],
                                'state': client[11],
                                'zipcode': client[12],
                                'clientTags': [],
                                'contactDetails': _contactDetails,
                                'additionalNotes': "",
                                'passportDetails': [],
                                'workspaceExtensions': [],
                                'clientUniqueId': COMMON_ROUTE.generateRandomNumber(6),
                                'tripCounter': 0
                            }

                            // Call an asynchronous function, often a save() to DB
                            if (count > 0) {
                                insertClientFromImport(_email, clientObject, insertedEmails, function (err, insertResult) {
                                    count++;

                                    if (!err && insertResult) {
                                        insertedEmails.push(_email);
                                        totalSavedCount++;
                                    } else {
                                        if (client[0] != "") {
                                            client.push(err);
                                            client[3] = _DOB;
                                            notSavedArray.push(client);
                                            notSavedCount++;
                                        }
                                    }
                                    if ((count) >= results.length) {
                                        json.status = '1';
                                        for (var index = 0; index < sMailIds.length; index++) {
                                            if (sMailIds[index][0] != "") {
                                                sMailIds[index].push("Client already exists");
                                                notSavedArray.push(sMailIds[index]);
                                            }
                                        }
                                        json.result = { 'message': totalSavedCount + ' Clients Imported Successfully', 'totalSavedCount': totalSavedCount, 'notSavedCount': notSavedCount, 'notSaved': notSavedArray };
                                        res.send(json);
                                    }

                                });
                            } else {
                                count++;
                            }
                        },
                        // 3rd param is the function to call when everything's done
                        function (err) {
                            // All tasks are done now
                            // doSomethingOnceAllAreDone();
                            if ((count + 1) >= results.length) {
                                json.status = '1';
                                json.result = { 'message': totalSavedCount + ' Clients Imported Successfully', 'totalSavedCount': totalSavedCount, 'notSavedCount': notSavedCount, 'notSaved': notSavedArray };
                                res.send(json);
                            }
                        }
                    );

                });
            }
        }
    });
}

function checkImportFileFormat(headerColumns) {

    var correctHeaderColumns = ["First Name",
        "Middle Name",
        "Last Name",
        "Birth Date (mm/dd/yyyy)",
        "Mobile phone",
        "Home phone",
        "Email",
        "Gender (M/F)",
        "Address1",
        "Address2",
        "City",
        "State",
        "Zip Code"
    ],
        errorMessage = "";

    for (var i = 0; i < correctHeaderColumns.length; i++) {
        if (headerColumns[i] && correctHeaderColumns[i].toLowerCase() !== headerColumns[i].toLowerCase()) {
            errorMessage = errorMessage + correctHeaderColumns[i] + " should be at column position " + (i + 1) + ".";
        }
    }
    return errorMessage;
}


function removeDuplicate(results, callback) {
    var obj = {};
    var sMailIds = [];
    var array = results.filter(function (item) {
        return obj.hasOwnProperty(item[6]) ? !(sMailIds.push(item)) : (obj[item[6]] = true)
    })
    callback(array, sMailIds.length, sMailIds);
}

// Fucnction is not in used currently, But I keeping this because if blob URI will not works
// for downloading data then we can use this.
function _downloadFile(req, res, next) {
    var data = req.body.data;
    var csvData = "";
    for (var index = 0; index < data.length; index++) {
        csvData = csvData + data[index].join(",") + "\r\n";
    }
    // res.setHeader('Content-disposition', 'attachment; filename="error.csv"');
    res.attachment('error.csv');
    //res.set('Content-Type', 'application/octet-stream');
    res.status(200).send(csvData);
}

//  Utility Function
function getTripsCountByClientIdUtil(clientId, callback) {
    var query = {};
    var countQuery = {};
    var totalTrips = 0;
    var clientId = clientId;

    if (!COMMON_ROUTE.isValidId(clientId)) {
        return 0;
    } else {
        query = countQuery = { travelerDetails: { $elemMatch: { travelerId: clientId } } };
        TRIPS_COLLECTION.count(countQuery, function (err, count) {
            totalTrips = count;
            callback(totalTrips);
        });
    }
}