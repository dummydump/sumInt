var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

//Collection clients
var clients = new Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    nickName: String,
    birthDate: String,
    anniversaryDate: String,
    agent: {
        agentId: String,
        agentFirstName: String,
        agentLastName: String,
    },
    gender: String,
    mapAddress: String,
    latitude: String,
    longitude: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipcode: String,
    clientTags: [],
    contactDetails: [],
    additionalNotes: String,
    passportDetails: [],
    workspaceExtensions: [],
    tripCounter: Number
}, { collection: 'clients' });
exports.clients = mongoose.model('clients', clients);

//Collection relatives
var relatives = new Schema({
    clientId: String,
    relativeClientId: String,
    relation: String,
}, { collection: 'relatives' });
exports.relatives = mongoose.model('relatives', relatives);

//Collection users
var users = new Schema({
    email: String,
    roleName: String,
    gender: String,
    firstName: String,
    lastName: String,
    phone1: String,
    phone2: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    provider: String,
    assistantOf: String
}, { collection: 'users' });
exports.users = mongoose.model('users', users);

//Collection roles
var roles = new Schema({
    name: String,
    access: []
}, { collection: 'roles' });
exports.roles = mongoose.model('roles', roles);

//Collection modules
var modules = new Schema({
    name: String
}, { collection: 'modules' });
exports.modules = mongoose.model('modules', modules);

//Collection trips
var trips = new Schema({
    tripType: String,
    startDate: String,
    endDate: String,
    agent: {
        agentId: String,
        agentFirstName: String,
        agentLastName: String,
    },
    tripStatus: String,
    tripDescription: String,
    workspaceExtensions: [],
    travelerDetails: [],
    primary: {
        id: String,
        name: String
    }
}, { collection: 'trips' });
exports.trips = mongoose.model('trips', trips);

//Collection itineraries
var itineraries = new Schema({
    templateName: String,
    tripId: String,
    clientId: String,
    flights: [],
    properties: [],
    cruises: [],
    tours: [],
    trains: [],
    carRentals: [],
    groundTransfer: []
}, { collection: 'itineraries' });
exports.itineraries = mongoose.model('itineraries', itineraries);

//Collection cruise_itineraries
var cruise_itineraries = new Schema({
    cruise_line_id: String,
    title: String,
    shipId: String,
    departure_port_id: String,
    no_of_day: Number,
    itinerary: [],
    price: String,
    descriptionHTML: String
}, { collection: 'cruise_itineraries' });
exports.cruise_itineraries = mongoose.model('cruise_itineraries', cruise_itineraries);

//Collection ports
var ports = new Schema({
    name: String,
    city: String,
    state: String,
    country: String,
    main_image_url: String,
    descriptionHTML: String
}, { collection: 'ports' });
exports.ports = mongoose.model('ports', ports);

//Collection ships
var ships = new Schema({
    name: String,
    cruiseLineId: String,
}, { collection: 'ships' });
exports.ships = mongoose.model('ships', ships);

//Collection trip_activities
var trip_activities = new Schema({
    tripId: String,
    activity: String,
    activityDate: String,
    activityTime: String,
    activityName: String,
    confirmationNumber: String,
    description: String
}, { collection: 'trip_activities' });
exports.trip_activities = mongoose.model('trip_activities', trip_activities);

//Collection bookings
var bookings = new Schema({
    tripId: String,
    bookingNumber: String,
    groupBookingId: String,
    bookingDate: String,
    tourOperatorId: String,
    startDate: String,
    endDate: String,
    packagePrice: String,
    commisionEarned: String,
    alternateCommision: String,
    personalTravel: Boolean,
    commisionExpected: String,
    agentName: String,
    bookingStatus: String,
    description: String,
    commisionReceived : Number
    
}, { collection: 'bookings' });
exports.bookings = mongoose.model('bookings', bookings);

//Collection payments
var payments = new Schema({
    payeeClientId: String,
    bookingNumber: String,
    paymentDate: String,
    paymentAmount: Number,
    paymentType: String,
    clientCreditCard: String,
    description: String,
    paymentStatus: String,
    tripId: String
}, { collection: 'payments' });
exports.payments = mongoose.model('payments', payments);

//Collection documents
var documents = new Schema({
    fileName: String,
    size: String,
    uploadedDate: String,
    uploadedBy: String,
    tripId: String
}, { collection: 'documents' });
exports.documents = mongoose.model('documents', documents);

//Collection notes
var notes = new Schema({
    note: String,
    noteDate: String,
    addedBy: String,
    tripId: String
}, { collection: 'notes' });
exports.notes = mongoose.model('notes', notes);

//Collection tasks
var tasks = new Schema({

    subject: String,
    dueDate: String,
    reminder: String,
    assignedTo: {
        agentId: String,
        agentFirstName: String,
        agentLastName: String
    },
    description: String,
    taskType: String,
    taskStatus: String,
    tripId: String,

    subject: String,
    dueDate: String,
    reminder: String,
    assignedToAgentId: String,
    description: String,
    taskType: String,
    taskStatus: String,
    tripId: String

}, { collection: 'tasks' });
exports.tasks = mongoose.model('tasks', tasks);

//Collection tour_operators
var tour_operators = new Schema({
    name: String,
    telephone: String,
    email: String,
    website: String,
    owner: String
}, { collection: 'tour_operators' });
exports.tour_operators = mongoose.model('tour_operators', tour_operators);

//Collection properties
var properties = new Schema({
    name: String,
    city: String,
    country: String,
    landmark: String,
    rating: String,
    lowRate: String,
    highRate: String,
    propertyType: String,
    propertyImages: [String],
    propertyAmenities: [{
        text: String
    }]
}, { collection: 'properties' });
exports.properties = mongoose.model('properties', properties);

//Collection rooms
var rooms = new Schema({
    name: String,
    address: String,
    text: String,
}, { collection: 'rooms' });
exports.rooms = mongoose.model('rooms', rooms);

//Collection airlines
var airlines = new Schema({
    name: String,
    IATA: String,
    ICAO: String,
    callSign: String,
    alias: String,
    country: String
}, { collection: 'airlines' });
exports.airlines = mongoose.model('airlines', airlines);

//Collection cruise_lines
var cruise_lines = new Schema({
    name: String,
    ships: Number,
    cruiseImages: [String],
    cruiseAmenities: [{
        title: String,
        text: String
    }]
}, { collection: 'cruise_lines' });
exports.cruise_lines = mongoose.model('cruise_lines', cruise_lines);

//Collection settings
var settings = new Schema({
    settingKey: String,
    settingValues: [],
}, { collection: 'settings' });
exports.settings = mongoose.model('settings', settings);

//Collection trip_details
var trip_details = new Schema({
    tripId: String,
    tripDetailType: String,
    tripDetailContent: String
}, { collection: 'trip_details' });
exports.trip_details = mongoose.model('trip_details', trip_details);

//Collection tours
var tours = new Schema({
    tourName: String,
    country: String,
    city: String,
}, { collection: 'tours' });
exports.tours = mongoose.model('tours', tours);


//Collection workspace_extensions
var workspace_extensions = new Schema({
    clientId: String,
    title: String,
    type: String,
    emailCounter: Number
}, { collection: 'workspace_extensions' });
exports.workspace_extensions = mongoose.model('workspace_extensions', workspace_extensions);

//Collection email_automation
var email_automation = new Schema({
    templateId: String,
    sendDate: String,
    sendTime: String,
    placeholders: {
        text: String
    },
    workspaceExtensionId: String,
    clientId: String,
    status: String,
    nextDate: String,
    recurrenceFrequency: String
}, { collection: 'email_automation' });
exports.email_automation = mongoose.model('email_automation', email_automation);

//Collection email_automation_history
var email_automation_history = new Schema({
    templateId: String,
    sendDate: String,
    sendTime: String,
    status: String,
    errorMessage: String,
    clientId: String,
    subject: String,
}, { collection: 'email_automation_history' });
exports.email_automation_history = mongoose.model('email_automation_history', email_automation_history);

//Collection templates
var templates = new Schema({
    type: String,
    subject: String,
    body: String
}, { collection: 'templates' });
exports.templates = mongoose.model('templates', templates);

//Collection events
var events = new Schema({
    startDate: Number,
    endDate: Number,
    type: String,
    title: String,
    status: String,
    agentId: String,
    taskId: String,
    tripId: String,
    googleCalendarEventId: String
}, { collection: 'events' });
exports.events = mongoose.model('events', events);

//Collection countries
var countries = new Schema({
    name: String
}, { collection: 'countries' });
exports.countries = mongoose.model('countries', countries);

//Collection states
var states = new Schema({
    name: String,
    countryId:String
}, { collection: 'states' });
exports.states = mongoose.model('states', states);

var cities = new Schema({
    name: String,
    stateId:String
}, { collection: 'cities' });
exports.cities = mongoose.model('cities', cities);

var invoices = new Schema({
    invoiceNumber: String,
    invoiceDate: String,
    tripId: String,
    amount : Number
}, { collection: 'invoices' });
exports.invoices = mongoose.model('invoices', invoices);

// Collection checks
var checks = new Schema({
    checkNumber : String,
    checkDate : Date,
    checkAmount : Number,
    reconciledAmount : Number,
    summary : String,
    senderId : String,
    recipient : String,
    status : String,
    bookingPayments :Number 
},{collection:'checks'});
exports.checks = mongoose.model('checks',checks);

// Collection suppliers 
var suppliers = new Schema({
    foreignId : String,
    name : String,
    type : String
},{collection: 'suppliers'});
exports.suppliers = mongoose.model('suppliers',suppliers);

// Collection reconciliation
var reconciliation = new Schema({
    bookingId : String,
    checkId : String,
    receivedAmount : Number
},{collection: 'reconciliation'});
exports.reconciliation = mongoose.model('reconciliation',reconciliation);
