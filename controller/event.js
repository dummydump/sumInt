
var model = require('../models/model');
var EVENTS_COLLECTION = model.events;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var express = require('express');
var app = express();
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');

/*-------------------------------------------------------*/
exports.addEvent = _addEvent;
exports.getEventById = _getEventById;
exports.getEvents = _getEvents;
exports.updateEventById = _updateEventById;
exports.removeEventById = _removeEventById;
exports.removeEventByTripId = _removeEventByTripId;
exports.getEventByTripId = _getEventByTripId;
exports.getEventByTaskId = _getEventByTaskId;
/*-------------------------------------------------------*/

/*
TODO: POST To add new event.
*/
function _addEvent(req, res, next) {
    var json = {};

    var eventObject = {
        'startDate': new Date(req.body.startDate).getTime(),
        'endDate': new Date(req.body.endDate).getTime(),
        "type": req.body.type,
        "title": req.body.title,
        "status": req.body.status,
        "agentId": req.body.agentId,
        "taskId": req.body.taskId,
        "tripId": req.body.tripId,
        "googleCalendarEventId": req.body.googleCalendarEventId
    }

    if (COMMON_ROUTE.isUndefinedOrNull(eventObject.startDate) || COMMON_ROUTE.isUndefinedOrNull(eventObject.endDate) || COMMON_ROUTE.isUndefinedOrNull(eventObject.type) || COMMON_ROUTE.isUndefinedOrNull(eventObject.title) || COMMON_ROUTE.isUndefinedOrNull(eventObject.status)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {

        var event = new EVENTS_COLLECTION(eventObject);
        event.save(function (error, event) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new event!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New event added successfully.', '_id': event._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Event By Id
*/
function _updateEventById(req, res, next) {
    var eventId = req.params.eventId;
    var json = {};
    if (!COMMON_ROUTE.isValidId(eventId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Event Id!' };
        res.send(json);
    } else {

        var eventObject = {
            'startDate': req.body.startDate,
            'endDate': req.body.endDate,
            'type': req.body.type,
            'title': req.body.title,
            'status': req.body.status,
            'taskId': req.body.taskId,
            "agentId": req.body.agentId,
            'tripId': req.body.tripId,
            'googleCalendarEventId': req.body.googleCalendarEventId            
        }

        if (COMMON_ROUTE.isUndefinedOrNull(eventObject.startDate) || COMMON_ROUTE.isUndefinedOrNull(eventObject.endDate) || COMMON_ROUTE.isUndefinedOrNull(eventObject.type) || COMMON_ROUTE.isUndefinedOrNull(eventObject.title) || COMMON_ROUTE.isUndefinedOrNull(eventObject.status)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {

            var query = {
                $set: eventObject
            };
            EVENTS_COLLECTION.find({ _id: new ObjectID(eventId) }, function (eventerror, getEvent) {
                if (eventerror || !getEvent) {
                    json.status = '0';
                    json.result = { 'message': 'Event not exists!' };
                    res.send(json);
                } else {
                    EVENTS_COLLECTION.update({ _id: new ObjectID(eventId) }, query, function (error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating event!' };
                            res.send(json);
                        } else {

                            json.status = '1';
                            json.result = { 'message': 'Event updated successfully.', '_id': eventId };
                            res.send(json);
                        }
                    });
                }
            });

        }
    }
}

/*
TODO: POST To Remove Event By Id
*/
function _removeEventById(req, res, next) {
    var eventId = req.params.eventId;
    var json = {};
    if (!COMMON_ROUTE.isValidId(eventId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Event Id!' };
        res.send(json);
    } else {
        EVENTS_COLLECTION.find({ _id: new ObjectID(eventId) }, function (eventerror, getEvent) {
            if (eventerror || !getEvent) {
                json.status = '0';
                json.result = { 'message': 'Event not exists!' };
                res.send(json);
            } else {
                EVENTS_COLLECTION.deleteOne({ _id: new ObjectID(eventId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting event!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Event deleted successfully.', '_id': eventId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: POST To Remove event By Trip Id
*/
function _removeEventByTripId(req, res, next) {
    var tripId = req.params.tripId;
    var json = {};
    if (!COMMON_ROUTE.isValidId(tripId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Trip Id!' };
        res.send(json);
    } else {
        EVENTS_COLLECTION.deleteMany({ 'tripId': tripId }, function (error, result) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in deleting event!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Event deleted successfully.' }; //, '_id': eventId
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To get event by Id.
*/
function _getEventById(req, res, next) {
    var eventId = req.params.eventId;

    var json = {};
    if (!COMMON_ROUTE.isValidId(eventId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Event Id!' };
        res.send(json);
    } else {
        EVENTS_COLLECTION.findOne({ _id: new ObjectID(eventId) }, function (eventerror, getEvent) {
            if (eventerror || !getEvent) {
                json.status = '0';
                json.result = { 'message': 'Event not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Event found successfully.', 'event': getEvent };
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To get event by tripID.
*/
function _getEventByTripId(req, res, next) {
    // var tripId = req.params.tripId;
    var a = (req.params.tripId).split('--');
    var tripId = a[0];
    var type = a[1];

    var json = {};
    if (!COMMON_ROUTE.isValidId(tripId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Trip Id!' };
        res.send(json);
    } else {
        EVENTS_COLLECTION.findOne({ 'tripId': tripId, "type": type }, function (eventerror, getEvent) {
            if (eventerror || !getEvent) {
                json.status = '0';
                json.result = { 'message': 'Event not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Event found successfully.', 'event': getEvent };
                res.send(json);
            }
        });
    }
}

/*
TODO: GET To get event by Task ID.
*/
function _getEventByTaskId(req, res, next) {
    // var tripId = req.params.tripId; 
    var tripId = req.body.tripId;
    var taskId = req.body.taskId;
    var type = req.body.type;

    var json = {};
    if (!COMMON_ROUTE.isValidId(taskId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid task Id!' };
        res.send(json);
    } else {
        EVENTS_COLLECTION.findOne({ 'tripId': tripId, "type": type, "taskId": taskId }, function (eventerror, getEvent) {
            if (eventerror || !getEvent) {
                json.status = '0';
                json.result = { 'message': 'Event not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Event found successfully.', 'event': getEvent };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get events.
*/
function _getEvents(req, res, next) {
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var pageFlage = req.body.pageFlage;
    var agentId = req.body.agentId;
    var taskFilterValue = req.body.taskFilterValue;
    var tripFilterValue = req.body.tripFilterValue;
    var reminderFilterValue = req.body.reminderFilterValue;
    var calendarView = req.body.calendarView;
    var record = {};
    var pageReminderCount = (req.body.pageReminderCount) ? req.body.pageReminderCount : 0;
    var pageTripCount = (req.body.pageTripCount) ? req.body.pageTripCount : 0;
    var pageTaskCount = (req.body.pageTaskCount) ? req.body.pageTaskCount : 0;

    var skipReminder = (10 * pageReminderCount);
    var skipTrip = (10 * pageTripCount);
    var skipTask = (10 * pageTaskCount);

    var startTimestamp = COMMON_ROUTE.getTimestampByDate(startDate);

    var endTimestamp = COMMON_ROUTE.getTimestampByDate(endDate);

    var query =
        {
            $and: [
                { startDate: { $lte: endTimestamp } },
                { endDate: { $gte: startTimestamp } },
                { 'agentId': agentId },
                { type: 'trip' }
            ]
        };

    if (tripFilterValue && tripFilterValue != 'All') {
        query.status = tripFilterValue;
    }

    var taskQuery = {
        startDate: { $lte: endTimestamp },
        endDate: { $gte: startTimestamp },
        'agentId': agentId,
        type: 'task'
    };

    if (taskFilterValue && taskFilterValue != 'All') {
        taskQuery.status = taskFilterValue;
    }

    var reminderQuery = {
        $and: [
            { startDate: { $lte: endTimestamp } },
            { endDate: { $gte: startTimestamp } },
            { 'agentId': agentId },
            { type: 'reminder' }
        ]
    };

    if (reminderFilterValue && reminderFilterValue != 'All') {
        reminderQuery.status = reminderFilterValue;
    }

    if (pageFlage == 'trip') {

        getTripCounter(query, skipTrip, function (error, record) {
            if (error) {
                json.status = '0';
                json.result = { 'message': 'Error While Trip Counter :' + JSON.stringify(error) };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Events found successfully.', 'events': record };
                res.send(json);
            }
        })

    } else if (pageFlage == 'task') {

        getTaskCounter(taskQuery, skipTask, function (error, record) {
            if (error) {
                json.status = '0';
                json.result = { 'message': 'Error While Task Counter :' + JSON.stringify(error) };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Events found successfully.', 'events': record };
                res.send(json);
            }
        })

    } else if (pageFlage == 'reminder') {

        getReminderCounter(reminderQuery, skipReminder, function (error, record) {
            if (error) {
                json.status = '0';
                json.result = { 'message': 'Error While Reminder Counter :' + JSON.stringify(error) };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Events found successfully.', 'events': record };
                res.send(json);
            }
        })

    } else if (pageFlage == 'All' && calendarView == 'day') {
        getAllCounter(reminderQuery, taskQuery, query, pageReminderCount, pageTripCount, pageTaskCount, skipReminder, skipTrip, skipTask, 10, function (error, record) {
            if (error) {
                json.status = '0';
                json.result = { 'message': 'Error While All Counter :' + JSON.stringify(error) };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Events found successfully.', 'events': record };
                res.send(json);
            }
        });
    } else if (pageFlage == 'All' && calendarView == 'month') {
        getAllCounter(reminderQuery, taskQuery, query, null, null, null, null, null, null, null, function (error, record) {
            if (error) {
                json.status = '0';
                json.result = { 'message': 'Error While All Counter :' + JSON.stringify(error) };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Events found successfully.', 'events': record };
                res.send(json);
            }
        });
    } else {
        json.status = '1';
        json.result = { 'message': 'Events found successfully.', 'events': [] };
        res.send(json);
    }

}



function getTripCounter(query, skipTrip, callback) {
    var record = {};
    EVENTS_COLLECTION.find(query, function (tripserror, trips) {
        if (tripserror) {
            callback(false, []);
        } else {
            if (trips && trips.length > 0) {
                record['trips'] = trips;
                record['tripsCount'] = trips.length;
                callback(false, record);
            } else {
                record['trips'] = [];
                record['tripsCount'] = 0;
                callback(false, record);
            }
        }
    }).skip(skipTrip).limit(10)
}

function getTaskCounter(taskQuery, skipTask, callback) {
    var record = {};
    EVENTS_COLLECTION.find(taskQuery, function (taskerror, tasks) {
        if (taskerror) {
            callback(true, []);
        } else {

            if (tasks && tasks.length > 0) {
                record['tasks'] = tasks;
                record['tasksCount'] = tasks.length;
                callback(false, record);
            } else {
                record['tasks'] = [];
                record['tasksCount'] = 0;
                callback(false, record);
            }

        }
    }).skip(skipTask).limit(10)
}

function getReminderCounter(reminderQuery, skipReminder, callback) {
    var record = {};
    EVENTS_COLLECTION.find(reminderQuery, function (remindererror, reminders) {
        if (remindererror) {
            callback(true, []);
        } else {

            if (reminders && reminders.length > 0) {
                record['reminders'] = reminders;
                record['remindersCount'] = reminders.length;
                callback(false, record);
            } else {
                record['reminders'] = [];
                record['remindersCount'] = 0;
                callback(false, record);
            }

        }
    }).skip(skipReminder).limit(10)
}

function getAllCounter(reminderQuery, taskQuery, query, pageReminderCount, pageTripCount, pageTaskCount, skipReminder, skipTrip, skipTask, limit, callback) {
    var record = {};

    TotalCount(reminderQuery, taskQuery, query, function (error, counters) {
        if (!counters) {
            // json.status = '0';
            // json.result = { 'message': 'Error While Counter :' + JSON.stringify(error) };
            // res.send(json);
            callback(error, false);
        } else {

            EVENTS_COLLECTION.find(query, function (tripserror, trips) {
                if (tripserror) {
                    // json.status = '0';
                    // json.result = { 'message': 'Trips not found!' };
                    // res.send(json);
                    callback(tripserror, false);
                } else {

                    if (trips && trips.length > 0) {
                        record['trips'] = trips;
                        record['tripsCount'] = trips.length;
                    } else {
                        record['trips'] = [];
                        record['tripsCount'] = 0;
                    }

                    EVENTS_COLLECTION.find(taskQuery, function (taskerror, tasks) {
                        if (taskerror) {
                            // json.status = '0';
                            // json.result = { 'message': 'Tasks not found!' };
                            // res.send(json);
                            callback(taskerror, false);
                        } else {

                            if (tasks && tasks.length > 0) {
                                record['tasks'] = tasks;
                                record['tasksCount'] = tasks.length;
                            } else {
                                record['tasks'] = [];
                                record['tasksCount'] = 0;
                            }

                            EVENTS_COLLECTION.find(reminderQuery, function (remindererror, reminders) {
                                if (remindererror) {
                                    json.status = '0';
                                    json.result = { 'message': 'Reminders not found!' };
                                    res.send(json);
                                    callback(remindererror, false);
                                } else {

                                    if (reminders && reminders.length > 0) {
                                        record['reminders'] = reminders;
                                        record['remindersCount'] = reminders.length;
                                    } else {
                                        record['reminders'] = [];
                                        record['remindersCount'] = 0;
                                    }

                                    record['totalCounters'] = counters;
                                    callback(false, record);


                                }
                            }).skip(skipReminder).limit(limit)
                        }
                    }).skip(skipTask).limit(limit)
                }
            }).skip(skipTrip).limit(limit)
        }
    })
}


function TotalCount(ReminderQuery, TaskQuery, TripQuery, callback) {
    EVENTS_COLLECTION.count(ReminderQuery, function (ReminderErr, ReminderCount) {
        if (ReminderErr) {
            callback(ReminderErr, false);
        } else {
            EVENTS_COLLECTION.count(TaskQuery, function (TaskErr, TaskCount) {
                if (TaskErr) {
                    callback(TaskErr, false);
                } else {
                    EVENTS_COLLECTION.count(TripQuery, function (TripErr, TripCount) {
                        if (TripErr) {
                            callback(TripErr, false);
                        } else {
                            var obj = {
                                "tripCount": TripCount,
                                "taskCount": TaskCount,
                                "reminderCount": ReminderCount
                            }
                            callback(false, obj);
                        }
                    })
                }
            })
        }
    })
}