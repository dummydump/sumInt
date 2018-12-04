var model = require('../models/model');
var DOCUMENTS_COLLECTION = model.documents;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');
var fs = require('fs');
/*-------------------------------------------------------*/
exports.addDocument = _addDocument;
exports.getDocumentById = _getDocumentById;
exports.getDocuments = _getDocuments;
exports.updateDocumentById = _updateDocumentById;
exports.removeDocumentById = _removeDocumentById;
exports.uploadDocument = _uploadDocument;
/*-------------------------------------------------------*/

/*
TODO: POST To add new document.
*/
function _addDocument(req, res, next) {
    var json = {};
    var documentObject = {
        'fileName': req.body.fileName,
        'size': req.body.size,
        'uploadedDate': req.body.uploadedDate,
        'uploadedBy': req.body.uploadedBy,
        'tripId': req.body.tripId
    }

    if (COMMON_ROUTE.isUndefinedOrNull(documentObject.fileName)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var document = new DOCUMENTS_COLLECTION(documentObject);

        document.save(function(error, document) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new document!' };
                res.send(json);
            } else {

                json.status = '1';
                json.result = { 'message': 'Document(s) uploaded successfully!', '_id': document._id };
                res.send(json);
                // var query = { 'tripId': req.body.tripId };
                // DOCUMENTS_COLLECTION.count(query, function(err, count) {
                //     totalRecords = count;
                //     json.status = '1';
                //     json.result = { 'message': 'Document(s) uploaded successfully!', '_id': document._id, 'totalRecords': totalRecords };
                //     res.send(json);
                // });
            }
        });
    }
}

function _uploadDocument(req, res, next) {
    var path = require('path'); // add path module
    var tripId = req.params.tripId;
    if (req.files && req.files.file) {
        fs.readFile(req.files.file.path, function(err, data) { // readfilr from the given path
            var dirname = path.resolve(".") + '\\uploads\\' + tripId + '\\'; // path.resolve(“.”) get application directory path
            var originalFileName = req.files.file.originalFilename;
            var newFileName = originalFileName.replace(/\.[^/.]+$/, "") + "-" + (new Date()).getTime() + "." + originalFileName.split('.').pop();;
            var newPath = dirname + newFileName; // add the file name
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            fs.writeFile(newPath, data, function(err) { // write file in uploads folder
                if (err) {
                    json.status = '0';
                    json.result = { 'message': "Failed to upload your file" };
                    res.send(json);

                } else {
                    json.status = '1';
                    json.result = { 'message': 'Document(s) uploaded successfully!', fileName: newFileName };
                    res.send(json);
                }

            });
        });
    } else {
        json.status = '0';
        json.result = { 'message': "File is not found!" };
        res.send(json);
    }
}
/*
TODO: POST To Update Document By Id
*/
function _updateDocumentById(req, res, next) {
    var documentId = req.params.id;

    if (!COMMON_ROUTE.isValidId(documentId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Document Id!' };
        res.send(json);
    } else {
        var documentObject = {
            'fileName': req.body.fileName,
            'size': req.body.size,
            'uploadedDate': req.body.uploadedDate,
            'uploadedBy': req.body.uploadedBy,
            'tripId': req.body.tripId
        }

        if (COMMON_ROUTE.isUndefinedOrNull(documentObject.fileName)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: documentObject
            };

            DOCUMENTS_COLLECTION.find({ _id: new ObjectID(documentId) }, function(documenterror, getDocument) {
                if (documenterror || !getDocument) {
                    json.status = '0';
                    json.result = { 'message': 'Document not exists!' };
                    res.send(json);
                } else {
                    DOCUMENTS_COLLECTION.update({ _id: new ObjectID(documentId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating document!' };
                            res.send(json);
                        } else {
                            deleteFileAsync(getDocument);
                            json.status = '1';
                            json.result = { 'message': 'Document(s) uploaded successfully!', '_id': documentId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
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
TODO: POST To Remove Document By Id
*/
function _removeDocumentById(req, res, next) {
    var documentId = req.params.id;

    if (!COMMON_ROUTE.isValidId(documentId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Document Id!' };
        res.send(json);
    } else {
        DOCUMENTS_COLLECTION.find({ _id: new ObjectID(documentId) }, function(documenterror, getDocument) {
            if (documenterror || !getDocument) {
                json.status = '0';
                json.result = { 'message': 'Document not exists!' };
                res.send(json);
            } else {
                DOCUMENTS_COLLECTION.deleteOne({ _id: new ObjectID(documentId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting document!' };
                        res.send(json);
                    } else {
                        deleteFileAsync(getDocument);
                        json.status = '1';
                        json.result = { 'message': 'Document deleted successfully.', '_id': documentId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get document by Id.
*/
function _getDocumentById(req, res, next) {
    var documentId = req.params.id;

    if (!COMMON_ROUTE.isValidId(documentId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Document Id!' };
        res.send(json);
    } else {
        DOCUMENTS_COLLECTION.findOne({ _id: new ObjectID(documentId) }, function(documenterror, getDocument) {
            if (documenterror || !getCruiseLine) {
                json.status = '0';
                json.result = { 'message': 'Document not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Document found successfully.', 'document': getDocument };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get documents.
*/
function _getDocuments(req, res, next) {
    var query = {
        tripId: req.body.tripId
    };
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    DOCUMENTS_COLLECTION.count(query, function(err, count) {
        totalRecords = count;

        DOCUMENTS_COLLECTION.find(query, function(documenterror, documents) {
            if (documenterror || !documents) {
                json.status = '0';
                json.result = { 'message': 'Documents not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Documents found successfully.', 'documents': documents, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}