var model = require('../models/model');
var STATES_COLLECTION = model.states;
var COUNTRIES_COLLECTION = model.countries
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
exports.getAllStatesByCountryId = _getAllStatesByCountryId;
exports.getAllStates = _getAllStates;
exports.getStateById = _getStateById;
/*-------------------------------------------------------*/




/*
TODO: POST To get COUNTRIES.
*/
function _getAllStatesByCountryId(req, res, next) {
    var countryId = req.params.countryId;
    var query1 = {
        "countryID": countryId
    };

    STATES_COLLECTION.find(query1, function (stateerror, states) {
                        if (stateerror || !states) {
                            json.status = '0';
                            json.result = { 'message': 'States not found!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'States found successfully.', 'states': states };
                            res.send(json);
                        }
                    });

    // var countryIds=[];
    // COUNTRIES_COLLECTION.find(query1, function (countryerror, countries) {
    //     async.forEach(countries, function (country, callback) {
    //         countryIds.push(country._id);
    //         callback();
    //     }, function (err) {
    //         statesQuery = { country_id: { $in: countryIds } };

    //         query = statesQuery ;


            
    //         STATES_COLLECTION.find(query, function (stateerror, states) {
    //                 if (stateerror || !states) {
    //                     json.status = '0';
    //                     json.result = { 'message': 'States not found!' };
    //                     res.send(json);
    //                 } else {
    //                     json.status = '1';
    //                     json.result = { 'message': 'States found successfully.', 'states': states };
    //                     res.send(json);
    //                 }
    //             });
           

    //     });
    // });
}

function _getAllStates(req,res,next){


    STATES_COLLECTION.find({},function(stateerror,states){
        if (stateerror || !states) {
            json.status = '0';
            json.result = { 'message': 'States not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'States found successfully.', 'states': states };
            res.send(json);
        }
    })

}



function _getStateById(req,res,next){

var stateId = req.params.id;

    STATES_COLLECTION.find({"_id":stateId},function(stateerror,states){
        if (stateerror || !states) {
            json.status = '0';
            json.result = { 'message': 'States not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'States found successfully.', 'states': states };
            res.send(json);
        }
    })




}
