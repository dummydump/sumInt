var model = require('../models/model');
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
exports.getAllCountries = _getAllCountries;
exports.getCountryById = _getCountryById;
/*-------------------------------------------------------*/

/*
TODO: POST To get COUNTRIES.
*/
function _getAllCountries(req, res, next) {
	var query = {};
	COUNTRIES_COLLECTION.find(query, function (countrieserror, countries) {
		if (countrieserror || !countries) {
			json.status = '0';
			json.result = { 'message': 'Countries not found!' };
			res.send(json);
		} else {
			json.status = '1';
			json.result = { 'message': 'countries found successfully.', 'countries': countries };
			res.send(json);
		}
	});
}


function _getCountryById(req,res,next){

	var countryId = req.params.id;

	COUNTRIES_COLLECTION.find({"_id":countryId}, function (countrieserror, countries) {
		if (countrieserror || !countries) {
			json.status = '0';
			json.result = { 'message': 'Countries not found!' };
			res.send(json);
		} else {
			json.status = '1';
			json.result = { 'message': 'countries found successfully.', 'countries': countries };
			res.send(json);
		}
	});



}