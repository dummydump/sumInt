var requestify = require('requestify');

const COMMON_CALENDAR_ID = 'dev.team@jstigers.com';
const fs = require('fs');
var COMMON_ROUTE = require('./common');
const readline = require('readline');
const {google} = require('googleapis');
// const privatekey = require("../config/cupCakeFrontend.json");
const privatekey = require("../config/dev-key.json");
const SCOPE = ['https://www.googleapis.com/auth/calendar'];
const PREFIX_SUMMARY = "CRM-";
const TIMEZONE = "Asia/Kolkata";
const https = require('https');

/*-------------------------------------------------------*/
exports.getGoogleAuthToken = _getGoogleAuthToken;
exports.getGoogleCalendarList = _getGoogleCalendarList;
exports.addGoogleCalendarEvent = _addGoogleCalendarEvent;
exports.editGoogleCalendarEvent = _editGoogleCalendarEvent;
exports.getGoogleCalendarEvents = _getGoogleCalendarEvents;
exports.notifications = _notifications;

/*-------------------------------------------------------*/


/*
TODO: POST To get all google calendars list.
*/
function _getGoogleCalendarList() {
  var calendar = google.calendar('v3');
  calendar.calendarList.list({
    auth: jwtClient
  }, function (err, response) {
    if (err) {
      console.log(err);

    } else {
      var calendars = response.data.items;
    }
  });
}

/*
TODO: GET To get Google Auth Token.
*/
function _getGoogleAuthToken(req, res, next) {
  var json = {};

  const serviceEmail = privatekey.client_email;
  const serviceKeyFile = "./config/dev-cert.p12";

  const jwtClient = new google.auth.JWT(
    serviceEmail,
    serviceKeyFile,
    null,
    SCOPE);

  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      json.status = '0';
      json.result = { 'message': 'Fail to authenticate google.' };
      res.send(json);
    } else {
      console.log(tokens);
      json.status = '1';
      json.result = { 'message': 'Authentication successfully.', tokens: tokens };
      res.send(json);
    }
  });

}

/*
TODO: POST To add new google calendar events.
*/
function _addGoogleCalendarEvent(req, res, next) {
  var json = {};
  var CALENDAR_ID = (req.body.calendarId) ? req.body.calendarId : COMMON_CALENDAR_ID;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  var summary = req.body.title;
  var type = req.body.type;

  var reminderMin = 840;
  var reminderDays = req.body.reminderDays;
  if(reminderDays && reminderDays > 0) {
      console.log(' reminderDays ' + reminderDays);
      reminderMin = reminderMin * parseInt(reminderDays);
  }

  var description = req.body.description;
  const serviceEmail = privatekey.client_email;
  const serviceKeyFile = "./config/dev-cert.p12";

  const jwtClient = new google.auth.JWT(
    serviceEmail,
    serviceKeyFile,
    null,
    SCOPE);

  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      json.status = '0';
      json.result = { 'message': 'Fail to authenticate google.' };
      res.send(json);
    } else {
      console.log("Successfully connected!");
      addEditEvent(jwtClient, CALENDAR_ID, "", startDate, endDate, summary, description, type, reminderMin, (addErr, addEventRes) => {
        if (addErr) {
          json.status = '0';
          json.result = { 'message': 'Fail to add google calendar event.', 'err': addErr, 'event': addEventRes };
          res.send(json);
        } else {
          json.status = '1';
          json.result = { 'message': 'Google calendar event added successfully.', 'event': addEventRes };
          res.send(json);
        }
      });
    }
  });
}

/*
TODO: POST To edit new google calendar events.
*/
function _editGoogleCalendarEvent(req, res, next) {
  var json = {};
  var CALENDAR_ID = (req.body.calendarId) ? req.body.calendarId : COMMON_CALENDAR_ID;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;
  var summary = req.body.title;
  var description = req.body.description;
  var eventId = req.params.eventId;
  var type = req.body.type;
  var reminderMin = 840;
  var reminderDays = req.body.reminderDays;
  if(reminderDays && reminderDays > 0) {
      console.log(' reminderDays ' + reminderDays);
      reminderMin = reminderMin * parseInt(reminderDays);
  }

  const serviceEmail = privatekey.client_email;
  const serviceKeyFile = "./config/dev-cert.p12";

  const jwtClient = new google.auth.JWT(
    serviceEmail,
    serviceKeyFile,
    null,
    SCOPE);

  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      json.status = '0';
      json.result = { 'message': 'Fail to authenticate google.' };
      res.send(json);
    } else {
      console.log("Successfully connected!");
      addEditEvent(jwtClient, CALENDAR_ID, eventId, startDate, endDate, summary, description, type, reminderMin, (addErr, addEventRes) => {
        if (addErr) {
          json.status = '0';
          json.result = { 'message': 'Fail to add google calendar event.', 'err': addErr, 'event': addEventRes };
          res.send(json);
        } else {
          json.status = '1';
          json.result = { 'message': 'Google calendar event updated successfully.', 'event': addEventRes };
          res.send(json);
        }
      });
    }
  });
}

/*
TODO: POST To get all google calendar Events.
*/
function _getGoogleCalendarEvents(req, res, next) {
  var json = {};
  var CALENDAR_ID = (req.body.calendarId) ? req.body.calendarId : COMMON_CALENDAR_ID;
  var startDate = req.body.startDate;
  var endDate = req.body.endDate;

  startDate = COMMON_ROUTE.getDateByTimezone(new Date(startDate));
  endDate = COMMON_ROUTE.getDateByTimezone(new Date(endDate));

  const serviceEmail = privatekey.client_email;
  const serviceKeyFile = "./config/dev-cert.p12";

  const jwtClient = new google.auth.JWT(
    serviceEmail,
    serviceKeyFile,
    null,
    SCOPE);

  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    console.log('tokens', tokens);
    if (err) {
      console.log(err);
      json.status = '0';
      json.result = { 'message': 'Fail to authenticate google.' };
      res.send(json);
    } else {
      console.log("Successfully connected!");

      getEventsByCalendar(jwtClient, CALENDAR_ID, startDate, endDate, (getErr, eventList) => {
          json.status = '1';
          json.result = { 'message': 'Events found successfully.', 'err': getErr, 'events': eventList };
          res.send(json);
      });
    }
  });
}

function listEvents(auth) {
  const {google} = require('googleapis');
  const calendar = google.calendar({ version: 'v3', auth });
  calendar.events.list({
    calendarId: 'primary',
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, {data}) => {
    if (err) return console.log('The API returned an error: ' + err);
    console.log('data: ', data);
    const events = data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}


function getEventsByCalendar(jwtClient, CALENDAR_ID, startDate, endDate, callback) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: jwtClient,
    calendarId: CALENDAR_ID,
    fields: {
      items: ["start", "summary"]
    },
    timeMax: endDate,
    timeMin: startDate
  }, function (err, response) {
    if (err) {
      console.log(err);
      callback(err, []);
    } else {
      var events = response.data.items;
      if (events.length == 0) {
        console.log('No events found.');
        callback(null, events);
      } else {
        console.log('Event from Google Calendar:');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          // console.log('event', event);
          // console.log(`${start} - ${event.title} - ${event.summary}`);
        });
        callback(err, events);
      }
    }
  });
}

function addEditEvent(authClient, CALENDAR_ID, eventId, startDate, endDate, summary, desc, type, reminderMin, callback) {
  const {google} = require('googleapis');
  var calendar = google.calendar('v3');
  if (!COMMON_ROUTE.isValidTimestamp(startDate) || !COMMON_ROUTE.isValidTimestamp(endDate)) {
    callback('Error : Invalid start or enddate', null);
  } else if (COMMON_ROUTE.isUndefinedOrNull(summary)) {
    callback('Error : Summary is missing', null);
  } else {
    let reminders = {};

    if(type && type == 'task'){
      reminders = {
        "useDefault": false,
        "overrides": [
          {
            "method": "email",
            "minutes": reminderMin
          }
        ]
      }
    };

    

    if (COMMON_ROUTE.isUndefinedOrNull(eventId)) {
      console.log('reminders ' + JSON.stringify(reminders));
      calendar.events.insert({
        auth: authClient,
        calendarId: CALENDAR_ID,
        resource: {
          start: {
            date: COMMON_ROUTE.getDateYYYYMMDDNew(startDate),
            timeZone: TIMEZONE
          },
          end: {
            date: COMMON_ROUTE.getDateYYYYMMDDNew(endDate),
            timeZone: TIMEZONE
          },
          summary: PREFIX_SUMMARY + type + '-' + summary,
          description: desc,
          reminders: {
            "useDefault": false,
            "overrides": [
              {
                "method": "email",
                "minutes": 1440
              }
            ]
          }
        }
      }, function (err, eventRes) {
        if (err) {
          console.log('addEvent err', err);
          callback('Error while adding calendar event', null);
        } else {
          console.log(' EventRes', eventRes.data);
          callback(null, eventRes.data);
        }
      })
    } else {
      calendar.events.update({
        auth: authClient,
        calendarId: CALENDAR_ID,
        eventId: eventId,
        resource: {
          start: {
            date: COMMON_ROUTE.getDateYYYYMMDDNew(startDate),
            timeZone: TIMEZONE
          },
          end: {
            date: COMMON_ROUTE.getDateYYYYMMDDNew(endDate),
            timeZone: TIMEZONE
          },
          summary: PREFIX_SUMMARY + type + '-' + summary,
          description: desc,
          reminders: reminders
        }
      }, function (err, eventRes) {
        if (err) {
          console.log('EditEvent err', err);
          callback('Error while adding calendar event', null);
        } else {
          console.log(' Edit EventRes', eventRes.data);
          callback(null, eventRes.data);
        }
      })
    }

  }
}


function _notifications(req, res, next){
  var json = {};
  var CALENDAR_ID = COMMON_CALENDAR_ID;

  console.log("================= HERE WITH NOTIFICATION ===================");
  const serviceEmail = privatekey.client_email;
  const serviceKeyFile = "./config/dev-cert.p12";

  const jwtClient = new google.auth.JWT(
    serviceEmail,
    serviceKeyFile,
    null,
    SCOPE);

  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      json.status = '0';
      json.result = { 'message': 'Fail to authenticate google.' };
      res.send(json);
    } else {
      
      console.log('HEADERS ' + JSON.stringify(req.headers));

      if(tokens.access_token && req.headers && !COMMON_ROUTE.isUndefinedOrNull(req.headers['x-goog-resource-uri'])){
          getEventsFromGetUrl(req.headers['x-goog-resource-uri'], tokens.access_token, [], "test", (eventObj) =>{
            console.log('eventObj ' + JSON.stringify(eventObj));
          });
      }

      // addEditEvent(jwtClient, CALENDAR_ID, "", 1544416550000, 1544416550000, 'Notification', 'Notfication Desc', null, 840, (addErr, addEventRes) => {
      //   if (addErr) {
      //     json.status = '0';
      //     json.result = { 'message': 'Fail to add google calendar event.', 'err': addErr, 'event': addEventRes };
      //     res.send(json);
      //   } else {
      //     json.status = '1';
      //     json.result = { 'message': 'Google calendar event updated successfully.', 'event': addEventRes };
      //     res.send(json);
      //   }
      // });
    }
  });
}

function getEventsFromGetUrl(reqURL, access_token, data, nextPageToken, callback){
      let URL = reqURL;
      URL = URL.split("?")[0];
      URL = URL + '?alt=json';
      // Set the headers
      var headers = {
          'Authorization': "Bearer " + access_token,
          'Content-Type': "application/json"
      }

      var request = require('request');

      while (nextPageToken){
        // if(nextPageToken){
        //   URL = URL + '?alt=json&showDeleted=false&nextPageToken=' + nextPageToken;
        // }
        nextPageToken = null;
        console.log('URL ', URL);
        var options = {
            url: URL,
            method: 'GET',
            headers: headers
        }
        request(options, function (error, response, body) {
            console.log("error: ", error);
            var obj = JSON.parse(body);
            console.log("nextPageToken: " + obj.nextPageToken);
            console.log("obj: ", obj);
            
            data.push(obj);
            if(COMMON_ROUTE.isUndefinedOrNull(nextPageToken)){
              callback(data);
            } else {
              nextPageToken = obj.nextPageToken;
              URL = URL + '&nextPageToken=' + nextPageToken;
            }
        });
      }
      // while (nextPageToken);
        
}


function removeGoogleCalendarEventById(jwtClient, calendarId, eventId){
      var calendar = google.calendar('v3');
      var params = {
          auth: jwtClient,
          'calendarId': (calendarId)? calendarId : COMMON_CALENDAR_ID,
          'eventId': eventId
      };

      calendar.events.delete(params, function(err) {
        if (err) {
          console.log('The API returned an error: ' + err);
          callback(err, eventId);
        }
        console.log('Event deleted.');
        callback(null, eventId);
      });
}