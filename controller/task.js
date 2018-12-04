var model = require('../models/model');
var TASKS_COLLECTION = model.tasks;
var USERS_COLLECTION = model.users;
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
exports.addTask = _addTask;
exports.getTaskById = _getTaskById;
exports.getTasks = _getTasks;
exports.updateTaskById = _updateTaskById;
exports.removeTaskById = _removeTaskById;
exports.getTasksByRole = _getTasksByRole;
/*-------------------------------------------------------*/

/*
TODO: POST To add new task.
*/
function _addTask(req, res, next) {
    var json = {};
    var taskObject = {
        'subject': req.body.subject,
        'dueDate': req.body.dueDate,
        'reminder': req.body.reminder,
        'assignedToAgentId': req.body.assignedToAgentId,
        'description': req.body.description,
        'taskType': req.body.taskType,
        'taskStatus': req.body.taskStatus,
        'tripId': req.body.tripId
    }

    if (COMMON_ROUTE.isUndefinedOrNull(taskObject.subject)) {
        json.status = '0';
        json.result = { 'message': 'Required fields are missing!' };
        res.send(json);
    } else {
        var task = new TASKS_COLLECTION(taskObject);

        task.save(function(error, task) {
            if (error) {
                json.status = '0';
                json.result = { 'error': 'Error in adding new task!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'New task added successfully.', '_id': task._id };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To Update Task By Id
*/
function _updateTaskById(req, res, next) {
    var taskId = req.params.id;

    if (!COMMON_ROUTE.isValidId(taskId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Task Id!' };
        res.send(json);
    } else {
        var taskObject = {
            'subject': req.body.subject,
            'dueDate': req.body.dueDate,
            'reminder': req.body.reminder,
            'assignedToAgentId': req.body.assignedToAgentId,
            'description': req.body.description,
            'taskType': req.body.taskType,
            'taskStatus': req.body.taskStatus,

        }

        if (COMMON_ROUTE.isUndefinedOrNull(taskObject.subject)) {
            json.status = '0';
            json.result = { 'message': 'Required fields are missing!' };
            res.send(json);
        } else {
            var query = {
                $set: taskObject
            };

            TASKS_COLLECTION.find({ _id: new ObjectID(taskId) }, function(taskerror, getTask) {
                if (taskerror || !getTask) {
                    json.status = '0';
                    json.result = { 'message': 'Task not exists!' };
                    res.send(json);
                } else {
                    TASKS_COLLECTION.update({ _id: new ObjectID(taskId) }, query, function(error, result) {
                        if (error) {
                            json.status = '0';
                            json.result = { 'error': 'Error in updating task!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Task updated successfully.', '_id': taskId };
                            res.send(json);
                        }
                    });
                }
            });
        }
    }
}

/*
TODO: POST To Remove Task By Id
*/
function _removeTaskById(req, res, next) {
    var taskId = req.params.id;

    if (!COMMON_ROUTE.isValidId(taskId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Task Id!' };
        res.send(json);
    } else {
        TASKS_COLLECTION.find({ _id: new ObjectID(taskId) }, function(taskerror, getTask) {
            if (taskerror || !getTask) {
                json.status = '0';
                json.result = { 'message': 'Task not exists!' };
                res.send(json);
            } else {
                TASKS_COLLECTION.deleteOne({ _id: new ObjectID(taskId) }, function(error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting task!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Task deleted successfully.', '_id': taskId };
                        res.send(json);
                    }
                });
            }
        });
    }
}

/*
TODO: GET To get task by Id.
*/
function _getTaskById(req, res, next) {
    var taskId = req.params.id;

    if (!COMMON_ROUTE.isValidId(taskId)) {
        json.status = '0';
        json.result = { 'message': 'Invalid Task Id!' };
        res.send(json);
    } else {
        TASKS_COLLECTION.findOne({ _id: new ObjectID(taskId) }, function(taskerror, getTask) {
            if (taskerror || !getTask) {
                json.status = '0';
                json.result = { 'message': 'Task not exists!' };
                res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Task found successfully.', 'task': getTask };
                res.send(json);
            }
        });
    }
}

/*
TODO: POST To get tasks.
*/
function _getTasks(req, res, next) {
    var query = { tripId: req.body.tripId };
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var skip = (limit * pageCount);
    var totalRecords = 0;

    var search = {};
    if (req.body.search) {
        search = Object.assign({}, req.body.search)
    }
    //query.tripId = { $regex: new RegExp("^" + req.body.tripId, "i") };
    if (search) {
        if (search.subject) {
            query.subject = { $regex: new RegExp(search.subject, "i") };
        }
        // if (search.dueDate) {
        //     query.dueDate = { $regex: new RegExp("^" + search.dueDate.toLowerCase(), "i") };
        // }
        // if (search.reminder) {
        //     query.reminder = { $regex: new RegExp("^" + search.reminder.toLowerCase(), "i") };
        // }

        if (search.taskType) {
            query.taskType = { $regex: new RegExp("^" + search.taskType.toLowerCase(), "i") };
        }
        if (search.taskStatus) {
            query.taskStatus = { $regex: new RegExp("^" + search.taskStatus.toLowerCase(), "i") };
        }
    }

    if (search && search.assignedToAgentId) {
        var agentQuery = {};


        agentQuery.$or = [{ "firstName": { $regex: new RegExp("^" + search.assignedToAgentId.toLowerCase(), "i") } }, { "lastName": { $regex: new RegExp("^" + search.assignedToAgentId.toLowerCase(), "i") } }];
        console.log(agentQuery);

        USERS_COLLECTION.find(agentQuery, { _id: 1 }, function(agenterror, agents) {
            if (agenterror) {
                json.status = '0';
                json.result = { 'message': 'Agents not found!' };
                res.send(json);
            } else {
                var agentIds = [];
                if (agents && agents.length > 0) {
                    var agentIds = agents.map(function(item) { return item['_id']; });
                    query.assignedToAgentId = { $in: agentIds };
                }

                _getTasksByQuery(query, skip, limit, function(err, resultJson) {
                    res.send(resultJson);
                });

            }
        });
    } else {
        _getTasksByQuery(query, skip, limit, function(err, resultJson) {
            res.send(resultJson);
        });
    }
}

function _getTasksByQuery(query, skip, limit, callback) {
    var totalRecords = 0;

    TASKS_COLLECTION.count(query, function(err, count) {
        totalRecords = count;

        TASKS_COLLECTION.find(query, function(taskerror, tasks) {

            if (taskerror || !tasks) {
                json.status = '0';
                json.result = { 'message': 'Tasks not found!' };
                callback(taskerror, json);
                // res.send(json);
            } else {
                json.status = '1';
                json.result = { 'message': 'Tasks found successfully.', 'tasks': tasks, 'totalRecords': totalRecords };
                callback(null, json);
                // res.send(json);
            }
        }).skip(skip).limit(limit);
    });
}

function _getTasksByRole(req, res, next) {
    var query = {};
    if (req.body.assignedToAgentId) {
        query = { assignedToAgentId: req.body.assignedToAgentId };
    }
    var countQuery = {};
    var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    var agentIds = req.body.agentIds;
    var skip = (limit * pageCount);
    var totalRecords = 0;
    var searchReq = req.body.search;

    var search = {};
    if (req.body.search) {
        // console.log(' *---- req.body.search ' + JSON.stringify(req.body.search));
        search = Object.assign({}, req.body.search)
    }
    //query.tripId = { $regex: new RegExp("^" + req.body.tripId, "i") };
    if (search) {
        if (search.subject) {
            query.subject = { $regex: new RegExp(search.subject, "i") };
        }
        // if (search.dueDate) {
        //     query.dueDate = { $regex: new RegExp("^" + search.dueDate.toLowerCase(), "i") };
        // }
        // if (search.reminder) {
        //     query.reminder = { $regex: new RegExp("^" + search.reminder.toLowerCase(), "i") };
        // }

        if (search.taskType) {
            query.taskType = { $regex: new RegExp("^" + search.taskType.toLowerCase(), "i") };
        }
        if (search.taskStatus) {
            query.taskStatus = { $regex: new RegExp("^" + search.taskStatus.toLowerCase(), "i") };
        }
    }

    if ((agentIds && agentIds.length > 0) || (search.assignedToAgentId != '' && agentIds.length <= 0)) {
        query.assignedToAgentId = { $in: agentIds };
    } else if (!agentIds){
        query.assignedToAgentId = { $nin: agentIds };
    }

    _getTasksByQuery(query, skip, limit, function(err, resultJson) {
        res.send(resultJson);
    });
    
    // // if (search && search.assignedToAgentId) {
    // if (agentIds && agentIds.length > 0) {
        
    //     // if (agents && agents.length > 0) {
    //     //     var agentIds = agents.map(function(item) { return item['_id']; });
    //     //     query.assignedToAgentId = { $in: agentIds };
    //     // }

    //     query.assignedToAgentId = { $in: agentIds };

    //     _getTasksByQuery(query, skip, limit, function(err, resultJson) {
    //         console.log(' IF **** resultJson ' + JSON.stringify(resultJson.result.totalRecords));
    //         res.send(resultJson);
    //     });
        
    //     // var agentQuery = {};


    //     // agentQuery.$or = [{ "firstName": { $regex: new RegExp("^" + search.assignedToAgentId.toLowerCase(), "i") } }, { "lastName": { $regex: new RegExp("^" + search.assignedToAgentId.toLowerCase(), "i") } }];

    //     // USERS_COLLECTION.find(agentQuery, { _id: 1 }, function(agenterror, agents) {
    //     //     if (agenterror) {
    //     //         json.status = '0';
    //     //         json.result = { 'message': 'Agents not found!' };
    //     //         res.send(json);
    //     //     } else {
    //     //         var agentIds = [];
    //     //         if (agents && agents.length > 0) {
    //     //             var agentIds = agents.map(function(item) { return item['_id']; });
    //     //             query.assignedToAgentId = { $in: agentIds };
    //     //         }

    //     //         _getTasksByQuery(query, skip, limit, function(err, resultJson) {
    //     //             console.log(' IF **** resultJson ' + JSON.stringify(resultJson.result.totalRecords));
    //     //             res.send(resultJson);
    //     //         });

    //     //     }
    //     // });
    // } else {
    //     _getTasksByQuery(query, skip, limit, function(err, resultJson) {
    //         console.log(' ELSE **** resultJson ' + JSON.stringify(resultJson.result.totalRecords));
    //         res.send(resultJson);
    //     });
    // }
}