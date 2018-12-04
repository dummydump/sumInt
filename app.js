// Hari Branch
/*
 *	Module dependencies
 */
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var util = require('util');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var logger = require('morgan');
var mongoose = require('mongoose');
var database = require('./config/database'); // Get configuration file
var static = require('serve-static');
var app = express();
var controller = require('./controller');
var session = require('client-sessions');
var multipart = require('connect-multiparty');
var methodOverride = require('method-override');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var fs = require('fs');
var emailAutomation = require('./emailAutomation/emailAutomation');
var model = require('./models/model');
var CITIES_COLLECTION = model.cities;

var config = require('./config/config.json');
var CONSTANT = require('./config/constant.json');

/*
var CUP_CAKES_CRM_DB_USERNAME = process.env.CUP_CAKES_CRM_DB_USERNAME;
var CUP_CAKES_CRM_DB_PASS = process.env.CUP_CAKES_CRM_DB_PASS;
var CUP_CAKES_CRM_ENV = process.env.CUP_CAKES_CRM_ENV;
*/
var CUP_CAKES_CRM_DB_USERNAME = 'cupcakecrmdbuser';
var CUP_CAKES_CRM_DB_PASS = 'P4ZprjcCbkKxFmGVAwZa5GAaD4Cy93';
var CUP_CAKES_CRM_ENV = 'staging';


app.set('port', process.env.PORT || config.api_server_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('superSecret', CONSTANT.superSecret);
app.use(static(path.join(__dirname, 'public')));
app.use(multipart());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(methodOverride());
app.use(cors());

// Add headers
app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization ,Accept');

    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization ,Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// authentication

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers.authorization;

    var requestedPath = req.path;
    if (requestedPath === '/user/getUserToken') {
        next();
        // decode token
    } else if (token) {
        token = token.split(" ")[1];

        // verifies secret and checks exp
        //     if(token != CONSTANT.authToken){
        //         return res.json({ success: 0, message: 'Failed to authenticate token.' });
        //     } else {
        //         next();
        //    }
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: 0, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: 0,
            message: 'No token provided.'
        });
    }
});

app.use('/api', apiRoutes);


/*-----------------------All Routes List---------------------------------*/
var reports = require('./controller/reports');
var common = require('./controller/common');
var client = require('./controller/client');
var relative = require('./controller/relative');
var user = require('./controller/user');
var role = require('./controller/role');
var moduleCtrl = require('./controller/module');
var trip = require('./controller/trip');
var itinerary = require('./controller/itinerary');
var ship = require('./controller/ship');
var tripactivity = require('./controller/tripactivity');
var tripdetails = require('./controller/tripdetails');
var booking = require('./controller/booking');
var room = require('./controller/room');
var payment = require('./controller/payment');
var document = require('./controller/document');
var note = require('./controller/note');
var event = require('./controller/event');
var workspaceextension = require('./controller/workspaceextension');
var emailautomation = require('./controller/emailautomation');
var template = require('./controller/template');
var task = require('./controller/task');
var touroperator = require('./controller/touroperator');
var property = require('./controller/property');
var airline = require('./controller/airline');
var cruiseline = require('./controller/cruiseline');
var tour = require('./controller/tour');
var setting = require('./controller/setting');
var cruiseitinerary = require('./controller/cruiseitinerary');
var country = require('./controller/country');
var state = require('./controller/state');
var city = require('./controller/city');
var invoice = require('./controller/invoice');
var calendar = require('./controller/calendar');
var check = require('./controller/check');

/*------------------------------Common Routes--------------------------*/
app.get('/isValidId', common.isValidId);

/*--------------------------- Client Routes------------------------------*/
app.post('/api/client/addClient', client.addClient); // 
app.post('/api/client/getClientById/:id', client.getClientById); //
app.post('/api/client/updateClientById/:id', client.updateClientById); //
app.post('/api/client/removeClientById/:id', client.removeClientById); //
app.post('/api/client/getClients', client.getClients); //
app.post('/api/client/importClient', client.importClient); //
app.post('/api/client/getAllClients', client.getAllClients); //
app.post('/client/getClientToken', client.getClientToken); //
app.post('/api/client/increaseTripCounterByClientId/:id', client.increaseTripCounterByClientId);
app.post('/api/client/decreaseTripCountersByClientIds', client.decreaseTripCountersByClientIds);
/*--------------------------- Relative Routes------------------------------*/
app.post('/api/relative/addRelative', relative.addRelative); // 
app.post('/api/relative/updateRelativeById/:id', relative.updateRelativeById); // 
app.post('/api/relative/removeRelativeById/:id', relative.removeRelativeById); // 
app.post('/api/relative/getRelationsByClientId', relative.getRelativesByClientId); //

/*--------------------------- User Routes------------------------------*/
app.post('/user/getUserToken', user.getUserToken); // 
app.post('/api/user/addUser', user.addUser); // 
app.get('/api/user/getUserById/:id', user.getUserById); //
app.post('/api/user/updateUserById/:id', user.updateUserById); //
app.post('/api/user/removeUserById/:id', user.removeUserById); //
app.post('/api/user/getUsers', user.getUsers); //
app.post('/api/user/getAgents', user.getAgents); //
app.post('/api/user/userLogin', user.userLogin);

/*--------------------------- Role Routes------------------------------*/
app.post('/api/role/addRole', role.addRole); // 
app.get('/api/role/getRoleById/:id', role.getRoleById); //
app.post('/api/role/updateRoleById/:id', role.updateRoleById); //
app.post('/api/role/removeRoleById/:id', role.removeRoleById); //
app.post('/api/role/getRoles', role.getRoles); //

/*--------------------------- Module Routes------------------------------*/
app.post('/api/module/addModule', moduleCtrl.addModule); // 
app.get('/api/module/getModuleById/:id', moduleCtrl.getModuleById); //
app.post('/api/module/updateModuleById/:id', moduleCtrl.updateModuleById); //
app.post('/api/module/removeModuleById/:id', moduleCtrl.removeModuleById); //
app.post('/api/module/getModules', moduleCtrl.getModules); //

/*--------------------------- Trip Routes------------------------------*/
app.post('/api/trip/addTrip', trip.addTrip); // 
app.post('/api/trip/getTripById/:id', trip.getTripById); //
app.post('/api/trip/updateTripById/:id', trip.updateTripById); //
app.post('/api/trip/removeTripById/:id', trip.removeTripById); //
app.post('/api/trip/getTrips', trip.getTrips); //
app.post('/api/trip/getTripCountByClientId/:clientId', trip.getTripsCountByClientId); //
app.post('/api/trip/sendMail', trip.sendMail); //
app.post('/api/trip/sendInvoiceEmail', trip.sendInvoiceEmail); //
app.post('/api/trip/downloadPDF', trip.downloadPDF); //
app.get('/api/trip/getCountInfo/:id',trip.getCountInfo);

/*--------------------------- Itinerary Routes------------------------------*/
app.post('/api/itinerary/addItinerary', itinerary.addItinerary); // 
app.get('/api/itinerary/getItineraryById/:id', itinerary.getItineraryById); //
app.get('/api/itinerary/getItineraryByTripId/:tripId', itinerary.getItineraryByTripId); //
app.post('/api/itinerary/updateItineraryById/:id', itinerary.updateItineraryById); //
app.post('/api/itinerary/removeItineraryById/:id', itinerary.removeItineraryById); //
app.post('/api/itinerary/getItineraries', itinerary.getItineraries); //


/*--------------------------- TripActivity Routes------------------------------*/
app.post('/api/tripactivity/addTripActivity', tripactivity.addTripActivity); // 
app.get('/api/tripactivity/getTripActivityById/:id', tripactivity.getTripActivityById); //
app.post('/api/tripactivity/updateTripActivityById/:id', tripactivity.updateTripActivityById); //
app.post('/api/tripactivity/removeTripActivityById/:id', tripactivity.removeTripActivityById); //
app.post('/api/tripactivity/getTripActivities', tripactivity.getTripActivities); //
app.post('/api/tripactivity/getAllTripActivities', tripactivity.getAllTripActivities); //

/*--------------------------- Booking Routes------------------------------*/
app.post('/api/booking/addBooking', booking.addBooking); // 
app.get('/api/booking/getBookingById/:id', booking.getBookingById); //
app.post('/api/booking/updateBookingById/:id', booking.updateBookingById); //
app.post('/api/booking/removeBookingById/:id', booking.removeBookingById); //
app.post('/api/booking/getBookings', booking.getBookings); //
app.post('/api/booking/getAllBookingsByTripId', booking.getAllBookingsByTripId); //
app.post('/api/booking/getPaymentsByTripId', booking.getPaymentsByTripId); //

/*--------------------------- Payment Routes------------------------------*/
app.post('/api/payment/addPayment', payment.addPayment); // 
app.get('/api/payment/getPaymentById/:id', payment.getPaymentById); //
app.post('/api/payment/updatePaymentById/:id', payment.updatePaymentById); //
app.post('/api/payment/removePaymentById/:id', payment.removePaymentById); //
app.post('/api/payment/getPayments', payment.getPayments); //
app.post('/api/payment/getAllBookingWithPayments', payment.getAllBookingWithPayments); //
 

/*--------------------------- Document Routes------------------------------*/
app.post('/api/document/addDocument', document.addDocument); // 
app.get('/api/document/getDocumentById/:id', document.getDocumentById); //
app.post('/api/document/updateDocumentById/:id', document.updateDocumentById); //
app.post('/api/document/removeDocumentById/:id', document.removeDocumentById); //
app.post('/api/document/getDocuments', document.getDocuments); //
app.post('/api/document/uploadDocument/:tripId', document.uploadDocument); //

/*--------------------------- Note Routes------------------------------*/
app.post('/api/note/addNote', note.addNote); // 
app.get('/api/note/getNoteById/:id', note.getNoteById); //
app.post('/api/note/updateNoteById/:id', note.updateNoteById); //
app.post('/api/note/removeNoteById/:id', note.removeNoteById); //
app.post('/api/note/getNotes', note.getNotes); //

/*--------------------------- Event Routes------------------------------*/
app.post('/api/event/addEvent', event.addEvent); // 
app.get('/api/event/getEventById/:eventId', event.getEventById); //
app.get('/api/event/getEventByTripId/:tripId', event.getEventByTripId); //
app.post('/api/event/getEventBytaskId', event.getEventByTaskId); //
app.post('/api/event/updateEventById/:eventId', event.updateEventById); //
app.post('/api/event/removeEventById/:eventId', event.removeEventById); //
app.post('/api/event/removeEventByTripId/:tripId', event.removeEventByTripId); //
app.post('/api/event/getEvents', event.getEvents); //

/*--------------------------- Ship Routes------------------------------*/
app.post('/api/ship/addShip', ship.addShip); // 
app.get('/api/ship/getShipById/:id', ship.getShipById); //
app.post('/api/ship/updateShipById/:id', ship.updateShipById); //
app.post('/api/ship/removeShipById/:id', ship.removeShipById); //
app.post('/api/ship/getShips', ship.getShips); //
app.post('/api/ship/getPorts', ship.getPorts); //
app.post('/api/ship/listPortsByIds', ship.listPortsByIds); //
app.post('/api/ship/listShipsByIds', ship.listShipsByIds); //
app.post('/api/ship/removePortById/:id', ship.removePortById); //
app.post('/api/ship/addPort', ship.addPort); //
app.get('/api/ship/getPortById/:id', ship.getPortById); //
app.post('/api/ship/updatePortById/:id', ship.updatePortById); //
app.get('/api/ship/checkShipByCruiseId/:id', ship.checkShipByCruiseId);


/*--------------------------- Task Routes------------------------------*/
app.post('/api/task/addTask', task.addTask); // 
app.get('/api/task/getTaskById/:id', task.getTaskById); //
app.post('/api/task/updateTaskById/:id', task.updateTaskById); //
app.post('/api/task/removeTaskById/:id', task.removeTaskById); //
app.post('/api/task/getTasks', task.getTasks); //
app.post('/api/task/getTasksByRole', task.getTasksByRole); //


/*--------------------------- TourOperator Routes------------------------------*/
app.post('/api/touroperator/addTourOperator', touroperator.addTourOperator); // 
app.get('/api/touroperator/getTourOperatorById/:id', touroperator.getTourOperatorById); //
app.post('/api/touroperator/updateTourOperatorById/:id', touroperator.updateTourOperatorById); //
app.post('/api/touroperator/removeTourOperatorById/:id', touroperator.removeTourOperatorById); //
app.post('/api/touroperator/getTourOperators', touroperator.getTourOperators); //

/*--------------------------- Property Routes------------------------------*/
app.post('/api/property/addProperty', property.addProperty); // 
app.get('/api/property/getPropertyById/:id', property.getPropertyById); //
app.post('/api/property/updatePropertyById/:id', property.updatePropertyById); //
app.post('/api/property/removePropertyById/:id', property.removePropertyById); //
app.post('/api/property/getProperties', property.getProperties); //

/*--------------------------- Room Routes------------------------------*/
app.post('/api/room/addRoom', room.addRoom); // 
app.get('/api/room/getRoomById/:id', room.getRoomById); //
app.post('/api/room/removeRoomById/:id', room.removeRoomById); //
app.post('/api/room/getRooms', room.getRooms); //

/*--------------------------- Airline Routes------------------------------*/
app.post('/api/airline/addAirline', airline.addAirline); // 
app.get('/api/airline/getAirlineById/:id', airline.getAirlineById); //
app.post('/api/airline/updateAirlineById/:id', airline.updateAirlineById); //
app.post('/api/airline/removeAirlineById/:id', airline.removeAirlineById); //
app.post('/api/airline/getAirlines', airline.getAirlines); //

/*--------------------------- CruiseLine Routes------------------------------*/
app.post('/api/cruiseline/addCruiseLine', cruiseline.addCruiseLine); // 
app.get('/api/cruiseline/getCruiseLineById/:id', cruiseline.getCruiseLineById); //
app.post('/api/cruiseline/updateCruiseLineById/:id', cruiseline.updateCruiseLineById); //
app.post('/api/cruiseline/removeCruiseLineById/:id', cruiseline.removeCruiseLineById); //
app.post('/api/cruiseline/getCruiseLines', cruiseline.getCruiseLines); //
app.post('/api/cruiseline/listCruiseLinesByIds', cruiseline.listCruiseLinesByIds); //
app.post('/api/cruiseline/getAllCruiseLinesByTitle', cruiseline.getAllCruiseLinesByTitle); //

/*----------------------------Check Routes-----------------------------------------*/
app.post('/api/check/addCheck', check.addNewCheck); // 
app.get('/api/check/getCheckById/:id', check.getCheckById); //
app.get('/api/check/removeCheckById/:id',check.removeCheckById); //
app.post('/api/check/updateCheckById/:id',check.updateCheckById); //
app.post('/api/check/getChecks',check.getChecks); //
app.post('/api/check/getAllSuppliers',check.getAllSuppliers);
app.post('/api/check/addReconcilition',check.addReconciliation);
app.get('/api/check/getReconcilition/:id',check.getReconciliation);
app.post('/api/check/editReconcilition',check.editReconciliation);

/*-----------------------------CruiseItinerary Routes-------------------------------*/
app.post('/api/cruiseitinerary/addCruiseItinerary', cruiseitinerary.addCruiseItinerary); // 
app.get('/api/cruiseitinerary/getCruiseItineraryById/:id', cruiseitinerary.getCruiseItineraryById); //
app.post('/api/cruiseitinerary/updateCruiseItineraryById/:id', cruiseitinerary.updateCruiseItineraryById); //
app.post('/api/cruiseitinerary/removeCruiseItineraryById/:id', cruiseitinerary.removeCruiseItineraryById); //
app.post('/api/cruiseitinerary/getAllCruiseItinerariesByTitle', cruiseitinerary.getAllCruiseItinerariesByTitle); //
app.get('/api/cruiseitinerary/checkItineraryByCruiseId/:id',cruiseitinerary.checkItineraryByCruiseId);

/*--------------------------- Tour Routes------------------------------*/
app.post('/api/tour/addTour', tour.addTour); // 
app.get('/api/tour/getTourById/:id', tour.getTourById); //
app.post('/api/tour/updateTourById/:id', tour.updateTourById); //
app.post('/api/tour/removeTourById/:id', tour.removeTourById); //
app.post('/api/tour/getTours', tour.getTours); //


/*--------------------------- Setting Routes------------------------------*/
app.post('/api/setting/addSetting', setting.addSetting); // 
app.get('/api/setting/getSettingById/:id', setting.getSettingById); //
app.post('/api/setting/updateSettingById/:id', setting.updateSettingById); //
app.post('/api/setting/removeSettingById/:id', setting.removeSettingById); //
app.post('/api/setting/getSettings', setting.getSettings); //
app.post('/api/setting/getSettingByKey', setting.getSettingByKey); //

/*--------------------------- Trip Details Routes------------------------------*/
app.post('/api/tripdetails/addTripDetails', tripdetails.addTripDetails); // 
app.get('/api/tripdetails/getTripDetailsById/:id', tripdetails.getTripDetailsById); //
app.post('/api/tripdetails/updateTripDetailsById/:id', tripdetails.updateTripDetailsById); //
app.post('/api/tripdetails/removeTripDetailsById/:id', tripdetails.removeTripDetailsById); //
app.post('/api/tripdetails/getTripDetails', tripdetails.getTripDetails); //

/*--------------------------- Workspace Extensions Routes------------------------------*/
app.post('/api/workspaceextension/addWorkspaceExtension', workspaceextension.addWorkspaceExtension); // 
app.get('/api/workspaceextension/getWorkspaceExtensionById/:id', workspaceextension.getWorkspaceExtensionById); //
app.get('/api/workspaceextension/getWorkspaceExtensionByClientId/:clientId', workspaceextension.getWorkspaceExtensionByClientId); //
app.post('/api/workspaceextension/updateWorkspaceExtensionById/:id', workspaceextension.updateWorkspaceExtensionById); //
app.post('/api/workspaceextension/removeWorkspaceExtensionById/:id', workspaceextension.removeWorkspaceExtensionById); //
app.post('/api/workspaceextension/getWorkspaceExtensions', workspaceextension.getWorkspaceExtensions); //

/*--------------------------- Email Automation Routes------------------------------*/
app.post('/api/emailautomation/addEmailAutomation', emailautomation.addEmailAutomation); // 
app.get('/api/emailautomation/getEmailAutomationById/:id', emailautomation.getEmailAutomationById); //
app.post('/api/emailautomation/getEmailAutomationByWorkspaceExtIds', emailautomation.getEmailAutomationByWorkspaceExtIds); //
app.post('/api/emailautomation/updateEmailAutomationById/:id', emailautomation.updateEmailAutomationById); //
app.post('/api/emailautomation/removeEmailAutomationById/:id', emailautomation.removeEmailAutomationById); //
app.post('/api/emailautomation/removeEmailAutomationByWorkExtId/:workspaceExtensionId', emailautomation.removeEmailAutomationByWorkExtId); //
app.post('/api/emailautomation/getEmailAutomations', emailautomation.getEmailAutomations); //

/*--------------------------- Template Routes------------------------------*/
app.post('/api/template/addTemplate', template.addTemplate); // 
app.get('/api/template/getTemplateById/:id', template.getTemplateById); //
app.post('/api/template/updateTemplateById/:id', template.updateTemplateById); //
app.post('/api/template/removeTemplateById/:id', template.removeTemplateById); //
app.post('/api/template/getTemplates', template.getTemplates); //

/*-------------------------Country Routes ---------------------------------*/
app.post('/api/country/getAllCountry', country.getAllCountries);
app.get('/api/country/getCountryById/:id', country.getCountryById);

/*-------------------------State Routes ---------------------------------*/
app.get('/api/state/getAllStatesByCountryId/:countryId', state.getAllStatesByCountryId);
app.get('/api/state/getAllStates', state.getAllStates);
app.get('/api/state/getStateById/:id', state.getStateById);
/*-------------------------City Routes ---------------------------------*/
app.get('/api/city/getAllCitiesByStateId/:stateId', city.getAllCitiesByStateId);
app.get('/api/city/getAllCities', city.getAllCities);
app.get('/api/city/getCityById/:id', city.getCityById);

/*-------------------------Invoice Routes ---------------------------------*/
app.post('/api/invoice/addInvoice', invoice.addInvoice);
app.get('/api/invoice/getInvoiceByTripId/:id', invoice.getInvoiceByTripId);
app.get('/api/invoice/getInvoiceById/:id', invoice.getInvoiceById); //
        
app.get('/calendar/getGoogleAuthToken', calendar.getGoogleAuthToken); //
app.post('/calendar/getGoogleCalendarEvents', calendar.getGoogleCalendarEvents); //
app.post('/calendar/addGoogleCalendarEvent', calendar.addGoogleCalendarEvent); //
app.post('/calendar/editGoogleCalendarEventById/:eventId', calendar.editGoogleCalendarEvent); //
app.post('/calendar/getGoogleCalendarList', calendar.getGoogleCalendarList); //
app.post('/notifications', calendar.notifications ); //

/*-------------------------Report Routes ---------------------------------*/
app.post('/api/report/projectedIncome', reports.projectedIncome);


app.get('/', controller.apiview);

console.log('CUP_CAKES_CRM_DB_USERNAME ' + process.env.CUP_CAKES_CRM_DB_USERNAME);
console.log('CUP_CAKES_CRM_DB_PASS ' + process.env.CUP_CAKES_CRM_DB_PASS);
console.log('CUP_CAKES_CRM_ENV ' + process.env.CUP_CAKES_CRM_ENV);


if (!CUP_CAKES_CRM_DB_USERNAME || !CUP_CAKES_CRM_DB_PASS || !CUP_CAKES_CRM_ENV) {
    console.log('Database username and password and environment are not setup');
} else {
    //Connection with Database
    var databaseURL = (CUP_CAKES_CRM_ENV == 'production') ? database.serverdburl : database.localdburl;
    var mongoOpt = (CUP_CAKES_CRM_ENV == 'production') ? {
        "server": {
            "sslValidate": false,
            "sslKey": fs.readFileSync('config/keys/mongodb.pem').toString(),
            "sslCert": fs.readFileSync('config/keys/mongodb-cert.crt').toString(),
            "ssl": true
        },
        "user": CUP_CAKES_CRM_DB_USERNAME,
        "pass": CUP_CAKES_CRM_DB_PASS,
    } : {};

    console.log('databaseURL ' + databaseURL);
    mongoose.connect(databaseURL, mongoOpt);

    if (CUP_CAKES_CRM_ENV == 'production') {
        var privateKey = fs.readFileSync('config/keys/privkey.pem').toString();
        var certificate = fs.readFileSync('config/keys/fullchain.pem').toString();
        https.createServer({ key: privateKey, cert: certificate }, app).listen(app.get('port'), function() {
            console.log('Express server listening on port ' + app.get('port'));
        });
    } else {
        http.createServer(app).listen(app.get('port'), function() {
            console.log('Express server listening on port ' + app.get('port'));
        });
    }

    if (emailAutomation) {
        emailAutomation.initEmailSchedule();
    }
}
