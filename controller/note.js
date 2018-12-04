var model = require('../models/model');
var NOTES_COLLECTION = model.notes;
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
exports.addNote = _addNote;
exports.getNoteById = _getNoteById;
exports.getNotes = _getNotes;
exports.updateNoteById = _updateNoteById;
exports.removeNoteById = _removeNoteById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new note.
*/
function _addNote(req, res, next) {
    var json = {};
    var noteObject = {
        'note': req.body.note,
        'noteDate': req.body.noteDate,
        'addedBy': req.body.addedBy,
        'tripId': req.body.tripId
    }

    //if(COMMON_ROUTE.isUndefinedOrNull(noteObject.note) || COMMON_ROUTE.isUndefinedOrNull(noteObject.bookingNumber)){

    if (COMMON_ROUTE.isUndefinedOrNull(noteObject.note)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var note = new NOTES_COLLECTION(noteObject);

        note.save(function(error, note) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new note!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New note added successfully.', '_id': note._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Note By Id
*/
function _updateNoteById(req, res, next) {
    var noteId = req.params.id;

    if (!COMMON_ROUTE.isValidId(noteId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Note Id!' };
        res.send(json);
    } else {
        var noteObject = {
            'note': req.body.note,
            'noteDate': req.body.noteDate,
            'addedBy': req.body.addedBy,
            'tripId': req.body.tripId
        }

        if (COMMON_ROUTE.isUndefinedOrNull(noteObject.note) || COMMON_ROUTE.isUndefinedOrNull(noteObject.bookingNumber)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: noteObject
            };

            NOTES_COLLECTION.find({ _id: new ObjectID(noteId) }, function(noteerror, getNote) {
                if (noteerror || !getNote) {
                    json.status = '0';
                    json.result = { 'message': 'Note not exists!' };
                    res.send(json);
                } else {
                    NOTES_COLLECTION.update({ _id: new ObjectID(noteId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating note!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Note updated successfully.', '_id': noteId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove Note By Id
*/
function _removeNoteById(req, res, next) {
    var noteId = req.params.id;

    if (!COMMON_ROUTE.isValidId(noteId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Note Id!' };
        res.send(json);
    } else {
        NOTES_COLLECTION.find({ _id: new ObjectID(noteId) }, function(noteerror, getNote) {
            if (noteerror || !getNote) {
                json.status = '0';
                json.result = { 'message': 'Note not exists!' };
                res.send(json);
            } else {
                NOTES_COLLECTION.deleteOne({ _id: new ObjectID(noteId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting note!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Note deleted successfully.', '_id': noteId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get note by Id.
*/
function _getNoteById(req, res, next) {
    var noteId = req.params.id;

    if (!COMMON_ROUTE.isValidId(noteId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Note Id!' };
        res.send(json);
    } else {
        NOTES_COLLECTION.findOne({ _id: new ObjectID(noteId) }, function(noteerror, getNote) {
            if (noteerror || !getNote) {
                json.status = '0';
                json.result = { 'message': 'Note not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Note found successfully.', 'note': getNote };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get notes.
*/
function _getNotes(req, res, next) {
    var query = { tripId: req.body.tripId };
    var countQuery = {};
    //var limit = (req.body.limit) ? req.body.limit : 10;
    //var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    //var skip = (limit * pageCount);
    var totalRecords = 0;

    NOTES_COLLECTION.count(query, function(err, count) {
        totalRecords = count;

        NOTES_COLLECTION.find(query, function(noteerror, notes) {
            if (noteerror || !notes) {
                json.status = '0';
                json.result = { 'message': 'Notes not found!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Notes found successfully.', 'notes': notes, 'totalRecords': totalRecords };
                res.send(json);
            }
        }).sort({
            noteDate: -1
        });
    });
}