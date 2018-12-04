var model = require('../models/model');
var ObjectID = require('mongodb').ObjectID;
var parseXlsx = require('excel');
var csv = require('csv-parser');
var fs = require('fs');
var _ = require('lodash');
var validEXCELExts = new Array(".xlsx", ".xls");
var validCSVExts = new Array(".csv");
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var moment = require('moment');
var config = require('../config/config.json');
var http = require("http");
var https = require("https");
var requestify = require('requestify');

/*-------------------------------------------------------*/
exports.isValidId = _isValidId;
exports.isUndefinedOrNull = _isUndefinedOrNull;
exports.isObjEmpty = _isObjEmpty;
exports.isArrayEmpty = _isArrayEmpty;
exports.getTimestampByDate = _getTimestampByDate;
exports.getDateMMDDYYYY = _getDateMMDDYYYY;
exports.getDateYYYYMMDD = _getDateYYYYMMDD;
exports.getDateYYYYMMDDNew = _getDateYYYYMMDDNew;
exports.getDateByTimezone = _getDateByTimezone;
exports.getJsDateFromExcel = _getJsDateFromExcel;
exports.getValidDate = _getValidDate;
exports.generateRandomNumber = _generateRandomNumber;
exports.getRelation = _getRelation;
exports.ExcelCSVToJson = _ExcelCSVToJson;
exports.isValidEmail = _isValidEmail;
exports.sendMail = _sendMail;
exports.btoa = _btoa;
exports.getFormattedBirthday = _getFormattedBirthday;
exports.getFormattedAnniversaryDate = _getFormattedAnniversaryDate;
exports.getAge = _getAge;
exports.getAsDate = _getAsDate;
exports.getInvoice = getInvoice;
exports.isValidTimestamp = _isValidTimestamp;
exports.isNumeric = _isNumeric;


/*-------------------------------------------------------*/

var id_regex = new RegExp("^[0-9a-fA-F]{24}$");

/*
TYPE:GET
TODO: To check id is valid or not.
*/
function _isValidId(id) {
	if (typeof id != 'undefined' && id != "") {
		return id_regex.test(id);
	} else {
		return false;
	}
}

function _isValidEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email.toLowerCase());
}

/*
TYPE:GET
TODO: To value is undefined or null.
*/
function _isUndefinedOrNull(value) {
	return (typeof value == 'undefined' || value == null || value == "")
}

/*
TYPE:GET
TODO: To value is undefined or null.
*/
function _isObjEmpty(obj) {
	return (obj == null || !Object.keys(obj).length);
}

/*
TYPE:GET
TODO: To value is empty array.
*/
function _isArrayEmpty(array) {
	return (array == null || array.length <= 0);
}

/*
TYPE:GET
TODO: To getTimestampByDate.
*/
function _getTimestampByDate(date) {
	var ts = new Date(date).getTime();
	return ts;
}

/*
TYPE:GET
TODO: To format date in MMDDYYYY.
*/
function _getDateMMDDYYYY(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [month, day, year].join('-');
}

/*
TYPE:GET
TODO: To format date in YYYYMMDD.
*/
function _getDateYYYYMMDD(date) {
	var validDate = _getValidDate(date);

	if (validDate == '') {
		return "";
	} else {
		var month = '' + (validDate.getMonth() + 1),
			day = '' + validDate.getDate(),
			year = validDate.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		return [year, month, day].join('-');
	}

}

/*
TYPE:GET
TODO: To format date in YYYYMMDD.
*/
function _getDateYYYYMMDDNew(date) {
	if (!date) {
		return "";
	} else {
		date = new Date(date);
		var month = '' + (date.getMonth() + 1),
			day = '' + date.getDate(),
			year = date.getFullYear();

		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;

		return [year, month, day].join('-');
	}

}

function _getJsDateFromExcel(excelDate) {

	// JavaScript dates can be constructed by passing milliseconds
	// since the Unix epoch (January 1, 1970) example: new Date(12312512312);

	// 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")             
	// 2. Convert to milliseconds.
	if (excelDate) {
		return new Date((excelDate - (25567 + 2)) * 86400 * 1000);
	} else {
		return "";
	}
}


/*
TYPE:GET
TODO: To check string is valid date or note.
*/
function _getValidDate(s) {
	var dateStr = s.split('/');

	var date = new Date(dateStr[2], dateStr[1] - 1, dateStr[0]);

	if (date.getDate() == dateStr[0] && date.getMonth() + 1 == dateStr[1] && date.getFullYear() == dateStr[2]) {
		return date;
	} else {
		var dateStr = s.split('-');
		var date = new Date(dateStr[2], dateStr[1] - 1, dateStr[0]);
		if (date.getDate() == dateStr[0] && date.getMonth() + 1 == dateStr[1] && date.getFullYear() == dateStr[2]) {
			return date;
		} else {
			var dt = _getJsDateFromExcel(s);
			return (dt == 'Invalid Date') ? '' : dt;
		}
	}
}


/*
TYPE:GET
TODO: To Get reverse relation by string
*/
function _getRelation(relation, gender) {
	if (relation == 'Husband') {
		return 'Wife';
	} else if (relation == 'Wife') {
		return 'Husband';
	} else if (relation == 'Girlfriend') {
		return 'Boyfriend';
	} else if (relation == 'Boyfriend') {
		return 'Girlfriend';
	} else if (relation == 'Partner (Female)' && gender == 'male') {
		return 'Partner (Female)';
	} else if (relation == 'Partner (Male)' && gender == 'female') {
		return 'Partner (Male)';
	} else if ((relation == 'Mother' || relation == 'Father') && gender == 'male') {
		return 'Son';
	} else if ((relation == 'Mother' || relation == 'Father') && gender == 'female') {
		return 'Daughter';
	} else if ((relation == 'Daughter' || relation == 'Son') && gender == 'male') {
		return 'Father';
	} else if ((relation == 'Daughter' || relation == 'Son') && gender == 'female') {
		return 'Mother';
	} else if (relation == 'Sister' && gender == 'male') {
		return 'Brother';
	} else if (relation == 'Sister' && gender == 'female') {
		return 'Sister';
	} else if (relation == 'Brother' && gender == 'male') {
		return 'Brother';
	} else if (relation == 'Brother' && gender == 'female') {
		return 'Sister';
	} else if ((relation == 'Grandmother' || relation == 'GrandFather') && gender == 'male') {
		return 'Grandson';
	} else if ((relation == 'Grandmother' || relation == 'GrandFather') && gender == 'female') {
		return 'Granddaughter';
	} else if ((relation == 'Grandson' || relation == 'Granddaughter') && gender == 'male') {
		return 'GrandFather';
	} else if ((relation == 'Grandson' || relation == 'Granddaughter') && gender == 'female') {
		return 'Grandmother';
	} else if ((relation == 'Aunt' || relation == 'Uncle') && gender == 'male') {
		return 'Nephew';
	} else if ((relation == 'Aunt' || relation == 'Uncle') && gender == 'female') {
		return 'Niece';
	} else if ((relation == 'Nephew' || relation == 'Niece') && gender == 'male') {
		return 'Uncle';
	} else if ((relation == 'Nephew' || relation == 'Niece') && gender == 'female') {
		return 'Aunt';
	} else {
		return '';
	}
}


/*
TYPE:POST
TODO: To send mail
*/
function _sendMail(data, callback) {
	var options = {
		auth: {
			api_user: config.SENDGRID_USER,
			api_key: config.SENDGRID_PASSWORD
		}
	}

	var transporter = nodemailer.createTransport(sgTransport(options));

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: 'girishrathod98@gmail.com', // sender address
		to: data.sendTo,
		subject: 'Your Trip Itinerary', // Subject line
		text: '', // plaintext body
		html: data.HTML, // html body
		body: '',
		// attachments: [{'filename': 'attachment1.png', 'content': btoa(data.attachment)}]
		"attachments": data.attachments
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, 'Message sent: ' + info.response);
		}
	});
}

function _btoa(str) {
	if (Buffer.byteLength(str) !== str.length)
		throw new Error('bad string!');
	return Buffer(str, 'binary').toString('base64');
}

function _generateRandomNumber(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function _ExcelCSVToJson(file, ext, callback) {
	if (validEXCELExts.indexOf(ext) >= 0) {
		parseXlsx(file, function (err, data) {
			if (err) {
				callback(err, []);
			} else {
				callback(null, data);
			}
		});
	} else if (validCSVExts.indexOf(ext) >= 0) {
		fs.createReadStream(file)
			.pipe(csv({
				raw: false,     // do not decode to utf-8 strings
				separator: ',', // specify optional cell separator
				quote: '"',     // specify optional quote character
				escape: '"',    // specify optional escape character (defaults to quote value)
				newline: '\n',  // specify a newline character
				strict: true    // require column length match headers length
			}))
			.on('data', function (data) {
			})
	} else {
		callback('Type missing', []);
	}
}


function _getFormattedBirthday(birthdate, startDate, endDate) {
	if (birthdate != "") {

		var checkDate = new Date(birthdate);

		var _startDate = _getAsDate(startDate, '00:00');
		var _endDate = _getAsDate(endDate, '23:59');
		if (checkDate.getMonth() >= _startDate.getMonth() && checkDate.getMonth() <= _endDate.getMonth()) {
			if (checkDate.getDate() >= _startDate.getDate() && checkDate.getDate() <= _endDate.getDate()) {
				return _getAge(checkDate, _startDate)
			}
			else { return ""; }

		} else { return ""; }

	} else { return ""; }

}

function _getFormattedAnniversaryDate(anniversaryDate, startDate, endDate) {
	if (anniversaryDate != "") {

		var checkDate = new Date(anniversaryDate);

		var _startDate = _getAsDate(startDate, '00:00');
		var _endDate = _getAsDate(endDate, '23:59');
		if (checkDate.getMonth() >= _startDate.getMonth() && checkDate.getMonth() <= _endDate.getMonth()) {
			if (checkDate.getDate() >= _startDate.getDate() && checkDate.getDate() <= _endDate.getDate()) {
				var message = '(Anniversary date: ' + anniversaryDate + ')';
				return message;
			}
			else { return ""; }

		} else { return ""; }

	} else { return ""; }
}

function getDateMMddyyyy(date) {
	var d = new Date(date);
	var monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];

	return monthNames[d.getMonth() + 1] + " " + d.getDay() + ", " + d.getFullYear();

}

function _getAge(birth_date, tripStartDate) {
	var a = moment(tripStartDate);
	var b = moment(birth_date);
	birth_date = getDateMMddyyyy(birth_date); 
	var aDate = a.toDate();
	var bDate = b.toDate();

	var year_diff = aDate.getFullYear() - bDate.getFullYear();
	var month_diff = Math.abs(aDate.getMonth() - bDate.getMonth());
	var day_diff = Math.abs(aDate.getDate() - bDate.getDate());

	var years = a.diff(b, 'year');
	b.add(years, 'years');

	var months = a.diff(b, 'months');
	b.add(months, 'months');

	var days = a.diff(b, 'days');
	var message = '(Birth date: ' + birth_date + ' / ' + year_diff + ' years ' + month_diff + ' months ' + day_diff + ' days old on trip start day)';
	return message;
}

function _getAsDate(day, time) {
	var hours = Number(time.match(/^(\d+)/)[1]);
	var minutes = Number(time.match(/:(\d+)/)[1]);
	// var AMPM = time.match(/\s(.*)$/)[1];
	// if(AMPM == "pm" && hours<12) hours = hours+12;
	// if(AMPM == "am" && hours==12) hours = hours-12;


	var sHours = hours.toString();
	var sMinutes = minutes.toString();
	if (hours < 10) sHours = '0' + sHours;
	if (minutes < 10) sMinutes = '0' + sMinutes;
	time = sHours + ':' + sMinutes + ':00';
	var d = new Date(day);
	var n = d.toISOString().substring(0, 10);
	var newDate = new Date(n + "T" + time);
	return newDate;
}

function _getDateByTimezone(date){
	if(!date) return "";
	return new Date( date.getTime() + Math.abs(date.getTimezoneOffset()*60000));
}

function getInvoice(){
	var invoiceNumber = "";
		
	var x = 100000,y = 1000000;
	var part1 = Math.round( Math.random() * (y - x) + x );
	x = 10000,y = 100000;
	var part2 = Math.round( Math.random() * (y - x) + x );
	var part3 = Math.round( Math.random() * (9) );
	invoiceNumber = "" + part1+ "-"+ part2+"-" + part3;
	
	return invoiceNumber;
}


function _isValidTimestamp(_timestamp) {
    const newTimestamp = new Date(_timestamp).getTime();
    return _isNumeric(newTimestamp);
}

function _isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// function getJSON(options){
// 	let reqHandler = +options.port === 443 ? https : http;

// 	console.log('options.url', options.url);
// 	return new Promise((resolve, reject) => {
// 		let req = reqHandler.request(options.url, (res) =>
// 		{
// 			let output = '';
// 			res.setEncoding('utf8');

// 			res.on('data', function (chunk) {
// 				output += chunk;
// 			});

// 			res.on('end', () => {
// 				try {
// 					let obj = JSON.parse(output);
// 					// console.log('rest::', obj);
// 					resolve({
// 						statusCode: res.statusCode,
// 						data: obj
// 					});
// 				}
// 				catch(err) {
// 					console.error('rest::end', err);
// 					reject(err);
// 				}
// 			});
// 		});

// 		req.on('error', (err) => {
// 			console.error('rest::request', err);
// 			reject(err);
// 		});

// 		req.end();
// 	});
// }