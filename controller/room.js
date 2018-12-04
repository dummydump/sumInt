var model = require('../models/model');
var ROOMS_COLLECTION = model.rooms;
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
exports.addRoom = _addRoom;
exports.getRoomById = _getRoomById;
exports.getRooms = _getRooms;
exports.updateRoomById = _updateRoomById;
exports.removeRoomById = _removeRoomById;
/*-------------------------------------------------------*/

/*
TODO: POST To add new room.
*/
function _addRoom(req, res, next) {
	var json = {};
	var roomObject = {
		'name': req.body.name, 
		'address': req.body.address, 
		'text': req.body.text
    }

	if(COMMON_ROUTE.isUndefinedOrNull(roomObject.name) || COMMON_ROUTE.isUndefinedOrNull(roomObject.text)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var room = new ROOMS_COLLECTION(roomObject);

		room.save(function (error, room) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new room!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New room added successfully.','_id': room._id };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To Update Room By Id
*/
function _updateRoomById(req, res, next) {
	var roomId = req.params.id;

	if(!COMMON_ROUTE.isValidId(roomId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Room Id!' };
		res.send(json);
	} else {
		var roomObject = {
            'name': req.body.name, 
            'address': req.body.address, 
            'text': req.body.text
        }

		if(COMMON_ROUTE.isUndefinedOrNull(roomObject.name) || COMMON_ROUTE.isUndefinedOrNull(roomObject.text)){
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: roomObject
			};

			ROOMS_COLLECTION.find({ _id: new ObjectID(roomId)}, function (roomerror, getRoom) {
				if (roomerror || !getRoom) {
					json.status = '0';
					json.result = { 'message': 'Room not exists!' };
					res.send(json);
				} else {
					ROOMS_COLLECTION.update({ _id: new ObjectID(roomId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating room!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Room updated successfully.', '_id':roomId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove Room By Id
*/
function _removeRoomById(req, res, next) {
	var roomId = req.params.id;

	if(!COMMON_ROUTE.isValidId(roomId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Room Id!' };
		res.send(json);
	} else { 
		ROOMS_COLLECTION.find({ _id: new ObjectID(roomId)}, function (roomerror, getRoom) {
            if (roomerror || !getRoom) {
                json.status = '0';
                json.result = { 'message': 'Room not exists!' };
                res.send(json);
            } else {
                ROOMS_COLLECTION.deleteOne({ _id: new ObjectID(roomId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting room!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Room deleted successfully.', '_id':roomId };
                        res.send(json);
                    }
                });
            }
		});
	}
}

/*
TODO: GET To get room by Id.
*/
function _getRoomById(req, res, next) {
	var roomId = req.params.id;

	if(!COMMON_ROUTE.isValidId(roomId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Room Id!' };
		res.send(json);
	} else { 
		ROOMS_COLLECTION.findOne({ _id: new ObjectID(roomId)}, function (roomerror, getRoom) {
			if (roomerror || !getRoom) {
				json.status = '0';
				json.result = { 'message': 'Room not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Room found successfully.', 'room': getRoom };
				res.send(json);
			}
		});
	}
}

/*
TODO: POST To get rooms.
*/
function _getRooms(req, res, next) {
	var query = {};
	var limit = (req.body.limit)? req.body.limit : 10;
	var pageCount = (req.body.pageCount)? req.body.pageCount : 0;
	var skip = (limit * pageCount);
	var totalRecords = 0;
	
	
	ROOMS_COLLECTION.count({},function(err,count){
		totalRecords = count;
		ROOMS_COLLECTION.find(query, function (roomerror, rooms) {
			if (roomerror || !rooms) {
				json.status = '0';
				json.result = { 'message': 'Rooms not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Rooms found successfully.', 'rooms': rooms, 'totalRecords': totalRecords };
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});

}