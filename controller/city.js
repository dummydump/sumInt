var model = require('../models/model');
var STATES_COLLECTION = model.states;
var COUNTRIES_COLLECTION = model.countries;
var CITIES_COLLECTION = model.cities;
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
exports.getAllCitiesByStateId = _getAllCitiesByStateId;
exports.getAllCities = _getAllCities;
exports.getCityById = _getCityById;
/*-------------------------------------------------------*/




/*
TODO: POST To get COUNTRIES.
*/
function _getAllCitiesByStateId(req, res, next) {
    var stateId = req.params.stateId;
    var query1 = {
        "stateID": stateId
    };
   

    CITIES_COLLECTION.find(query1, function (cityerror, cities) {
                        if (cityerror || !cities) {
                            json.status = '0';
                            json.result = { 'message': 'Cities not found!' };
                            res.send(json);
                        } else {
                            json.status = '1';
                            json.result = { 'message': 'Cities found successfully.', 'cities': cities };
                            res.send(json);
                        }
                    });


}




function _getAllCities(req,res,next){



    CITIES_COLLECTION.find({}, function (cityerror, cities) {
        if (cityerror || !cities) {
            json.status = '0';
            json.result = { 'message': 'Cities not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Cities found successfully.', 'cities': cities };
            res.send(json);
        }
    });


}


function _getCityById(req,res,next){

    var cityId = req.params.id;

    CITIES_COLLECTION.find({"_id":cityId},function(cityerror,cities){
        if (cityerror || !cities) {
            json.status = '0';
            json.result = { 'message': 'Cities not found!' };
            res.send(json);
        } else {
            json.status = '1';
            json.result = { 'message': 'Cities found successfully.', 'cities': cities };
            res.send(json);
        }
    })



}