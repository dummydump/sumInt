var model = require('../models/model');
var SHIPS_COLLECTION = model.ships;
var PORTS_COLLECTION  = model.ports;
var CITIES_COLLECTION = model.cities;
var COUNTRIES_COLLECTION = model.countries;
var STATES_COLLECTION = model.states;
var url = require('url');
var json = {};
var querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;
var CONSTANT = require('../config/constant.json');
var COMMON_ROUTE = require('./common');


/*-------------------------------------------------------*/
exports.addShip = _addShip;
exports.getShipById = _getShipById;
exports.getShips = _getShips;
exports.updateShipById = _updateShipById;
exports.removeShipById = _removeShipById;
exports.getPorts = _getPorts;
exports.listPortsByIds = _listPortsByIds;
exports.listShipsByIds = _listShipsByIds;
exports.removePortById = _removePortById;
exports.addPort   = _addPort;
exports.getPortById = _getPortById;
exports.updatePortById = _updatePortById;
exports.checkShipByCruiseId = _checkShipByCruiseId;
/*-------------------------------------------------------*/

/*
TODO: POST To add new ship.
*/
function _addShip(req, res, next) {
	var json = {};
	var shipObject = {
		'name': req.body.name,
		'cruiseLineId':req.body.cruiseLineId
	}

	if(COMMON_ROUTE.isUndefinedOrNull(shipObject.name)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var ship = new SHIPS_COLLECTION(shipObject);

		ship.save(function (error, ship) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new ship!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New ship added successfully.', '_id':ship._id };
				res.send(json);
			}
		});
	}
}


/*
TODO: POST To Update Ship By Id
*/
function _updateShipById(req, res, next) {
	var shipId = req.params.id;

	if(!COMMON_ROUTE.isValidId(shipId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Ship Id!' };
		res.send(json);
	} else {
		var shipObject = {
			'name': req.body.name,
			'cruiseLineId':req.body.cruiseLineId
        }

        if(COMMON_ROUTE.isUndefinedOrNull(shipObject.name)){
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: shipObject
			};

			SHIPS_COLLECTION.find({ _id: new ObjectID(shipId)}, function (shiperror, getShip) {
				if (shiperror || !getShip) {
					json.status = '0';
					json.result = { 'message': 'Ship not exists!' };
					res.send(json);
				} else {
					SHIPS_COLLECTION.update({ _id: new ObjectID(shipId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating ship!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Ship updated successfully.', '_id':shipId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}

/*
TODO: POST To Remove Ship By Id
*/
function _removeShipById(req, res, next) {
	var shipId = req.params.id;

	if(!COMMON_ROUTE.isValidId(shipId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Ship Id!' };
		res.send(json);
	} else { 
		SHIPS_COLLECTION.find({ _id: new ObjectID(shipId)}, function (shiperror, getShip) {
            if (shiperror || !getShip) {
                json.status = '0';
                json.result = { 'message': 'Ship not exists!' };
                res.send(json);
            } else {
                SHIPS_COLLECTION.deleteOne({ _id: new ObjectID(shipId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting ship!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Ship deleted successfully.', '_id':shipId };
                        res.send(json);
                    }
                });
            }
		});
	}
}

/*
TODO: GET To get ship by Id.
*/
function _getShipById(req, res, next) {
	var shipId = req.params.id;

	if(!COMMON_ROUTE.isValidId(shipId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Ship Id!' };
		res.send(json);
	} else { 
		SHIPS_COLLECTION.findOne({ _id: new ObjectID(shipId)}, function (shiperror, getShip) {
			if (shiperror || !getShip) {
				json.status = '0';
				json.result = { 'message': 'Ship not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Ship found successfully.', 'ship': getShip };
				res.send(json);
			}
		});
	}
}

function _checkShipByCruiseId(req,res,next)
{
	var cruiseLineId = req.params.id;
	if(!COMMON_ROUTE.isValidId(cruiseLineId)){
		json.status = '0';
		json.result = { 'message': 'Invalid cruiseLineId Id!' };
		res.send(json);
	}else{
		SHIPS_COLLECTION.findOne({ "cruiseLineId" : cruiseLineId },function(shiperr, ship) {
			if(shiperr || !ship)
			{
				json.status = '0';
				json.result = { 'message': 'Ship not exists!' };
				res.send(json);
			}
			else{
				json.status = '1';
				json.result = { 'message': 'Ship found successfully.', 'ship': ship };
				res.send(json);	
			}

		});
	}
}

/*
TODO: POST To get ships.
*/
function _getShips(req, res, next) {
	var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    //	var searchBy = (req.body.searchBy)? req.body.searchBy : '';
    //	var searchValue = (req.body.searchBy)? req.body.searchValue : '';
    var skip = (limit * pageCount);
    var totalRecords = 0;
    var query = {};
    var countQuery = {};
	var search = {};
	var nameQuery = {};

    if (req.body.search) {
        search = Object.assign({}, req.body.search)
    }

	if (search) {
        if (search.name || search.cruiseLineId) {
            nameQuery = {'name': new RegExp(search.name, 'i')} || {'cruiseLineId': new RegExp("5a9632d15349943ba29b99e8",i)};
		}
	}
		var query = countQuery = Object.assign({},nameQuery);
		
	SHIPS_COLLECTION.count(countQuery, function(err,count){
		totalRecords = count;

		SHIPS_COLLECTION.find(query, function (shiperror, ships) {
			if (shiperror || !ships) {
				json.status = '0';
				json.result = { 'message': 'Ships not found!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Ships found successfully.', 'ships': ships , 'totalRecords': totalRecords};
				res.send(json);
			}
		}).skip(skip).limit(limit);
	});	
}

/*
TODO: POST To get Ports.
*/
function _getPorts(req, res, next) {
	
	var limit = (req.body.limit) ? req.body.limit : 10;
    var pageCount = (req.body.pageCount) ? req.body.pageCount : 0;
    //	var searchBy = (req.body.searchBy)? req.body.searchBy : '';
    //	var searchValue = (req.body.searchBy)? req.body.searchValue : '';
    var skip = (limit * pageCount);
    var totalRecords = 0;
    var query = {};
    var countQuery = {};
	var search = {};
	var nameQuery = {};

	if (req.body.search) {
        search = Object.assign({}, req.body.search)
    }
	
	if (search) {
        if (search.name) {
			nameQuery = {  'name': new RegExp(search.name, 'i') };
		}
	}
		var query = countQuery = Object.assign({},nameQuery);

	PORTS_COLLECTION.count(countQuery, function(err,count){
		totalRecords = count;

		PORTS_COLLECTION.find(query, function (porterror, ports) {
			
			if (porterror || !ports) {
				json.status = '0';
				json.result = { 'message': 'Ports not found!' };
				res.send(json);
			} else {
				getPortsDetails(ports,function(allCities,allStates,allCountries){
					json.status = '1';
					json.result = { 'message': 'Ports found successfully.', 'ports': ports, 'totalRecords':totalRecords,'cities':allCities,'states':allStates,'countries':allCountries};
					var result = [];
					res.send(json);
				});	
			}
		}).skip(skip).limit(limit);
	});
}

/*
TODO: POST To List Ports By Ids.
*/
function _listPortsByIds(req, res, next) {

	var ids = req.body;
	var obj_ids = ids.map((id) =>  { return ObjectID(id); });
	var query = {_id: {$in: obj_ids}};
	
	PORTS_COLLECTION.find({}, {name: 1},function (porterror, ports) {
		
		if (porterror || !ports) {
			json.status = '0';
			json.result = { 'message': 'Ports not found!' };
			res.send(json);
		} else {
			
			json.status = '1';
			json.result = { 'message': 'Ports found successfully.', 'ports': ports, 'totalRecords':ports.length };
			res.send(json);
		}
	});
}



/*
TODO: POST To List Ships By Ids.
*/
function _listShipsByIds(req, res, next) {

	var ids = req.body
	var obj_ids = ids.map(function(id) { return ObjectID(id); });
	var query = {_id: {$in: obj_ids}};

	SHIPS_COLLECTION.find({}, {name: 1},function (shiperror, ships) {
		
		if (shiperror || !ships) {
			json.status = '0';
			json.result = { 'message': 'Ships not found!' };
			res.send(json);
		} else {
			
			json.status = '1';
			json.result = { 'message': 'Ships found successfully.', 'ships': ships, 'totalRecords':ships.length };
			res.send(json);
		}
	});
}


/*
TODO: POST To Remove Port By Id
*/
function _removePortById(req, res, next) {
	var portId = req.params.id;

	if(!COMMON_ROUTE.isValidId(portId)){
		json.status = '0';
		json.result = { 'message': 'Invalid portId Id!' };
		res.send(json);
	} else { 
		PORTS_COLLECTION.find({ _id: new ObjectID(portId)}, function (porterror, getPort) {
            if (porterror || !getPort) {
                json.status = '0';
                json.result = { 'message': 'Port not exists!' };
                res.send(json);
            } else {
                PORTS_COLLECTION.deleteOne({ _id: new ObjectID(portId) }, function (error, result) {
                    if (error) {
                        json.status = '0';
                        json.result = { 'error': 'Error in deleting port!' };
                        res.send(json);
                    } else {
                        json.status = '1';
                        json.result = { 'message': 'Port deleted successfully.', '_id':portId };
                        res.send(json);
                    }
                });
            }
		});
	}
}


/*
TODO: POST To add new port.
*/
function _addPort(req, res, next) {
	var json = {};
	var portObject = {
		'name': req.body.name,
		'city': req.body.city,
		'state': req.body.state,
		'country': req.body.country,
		'main_image_url': req.body.main_image_url, 
	    'descriptionHTML' : req.body.descriptionHTML
	}

	if(COMMON_ROUTE.isUndefinedOrNull(portObject.name)){
		json.status = '0';
		json.result = { 'message': 'Required fields are missing!' };
		res.send(json);
	} else {
		var port = new PORTS_COLLECTION(portObject);

		port.save(function (error, port) {
			if (error) {
				json.status = '0';
				json.result = { 'error': 'Error in adding new port!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'New port added successfully.', '_id':port._id };
				res.send(json);
			}
		});
	}
}


/*
TODO: GET To get port by Id.
*/
function _getPortById(req, res, next) {
	var portId = req.params.id;

	if(!COMMON_ROUTE.isValidId(portId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Port Id!' };
		res.send(json);
	} else { 
		PORTS_COLLECTION.findOne({ _id: new ObjectID(portId)}, function (porterror, getport) {
			if (porterror || !getport) {
				json.status = '0';
				json.result = { 'message': 'Port not exists!' };
				res.send(json);
			} else {
				json.status = '1';
				json.result = { 'message': 'Port found successfully.', 'port': getport };
				res.send(json);
			}
		});
	}
}


/*
TODO: POST To Update Port By Id
*/
function _updatePortById(req, res, next) {
	var portId = req.params.id;

	if(!COMMON_ROUTE.isValidId(portId)){
		json.status = '0';
		json.result = { 'message': 'Invalid Port Id!' };
		res.send(json);
	} else {
		var portObject = {
			'name': req.body.name,
			'city': req.body.city,
			'state': req.body.state,
			'country': req.body.country,
			'main_image_url': req.body.main_image_url, 
			'descriptionHTML' : req.body.descriptionHTML
		}
	

        if(COMMON_ROUTE.isUndefinedOrNull(portObject.name)){
			json.status = '0';
			json.result = { 'message': 'Required fields are missing!' };
			res.send(json);
		} else {
			var query = {
				$set: portObject
			};

			PORTS_COLLECTION.find({ _id: new ObjectID(portId)}, function (porterror, getport) {
				if (porterror || !getport) {
					json.status = '0';
					json.result = { 'message': 'Port not exists!' };
					res.send(json);
				} else {
					PORTS_COLLECTION.update({ _id: new ObjectID(portId) }, query, function (error, result) {
						if (error) {
							json.status = '0';
							json.result = { 'error': 'Error in updating port!' };
							res.send(json);
						} else {
							json.status = '1';
							json.result = { 'message': 'Port updated successfully.', '_id':portId };
							res.send(json);
						}
					});
				}
			});
		}
	}
}



function getTravelerDetails(arr,callback) {
    
    var listOfIds = arr.map(a => ObjectID(a.travelerId));
    
    var listOfObjectIds = [];
    listOfIds.forEach(function (id) {
        listOfObjectIds.push(ObjectID(id));
        //console.log("id " +ObjectID(id));
    }, this);

    var query = {
        "_id": { "$in": listOfObjectIds }
    }

    CLIENTS_COLLECTION.find(query, { firstName: 1, middleName: 1, lastName: 1, birthDate: 1, anniversaryDate: 1, contactDetails: 1 }, function (clientrror, clients) {
        if (clientrror || !clients) {
            callback(clientrror, []);
        } else {
            callback(null, clients);
        }
    });
}



function getPortsDetails(arr,callback){



	var result = [];

	var listOfCityIds = arr.map(id => {
		if(ObjectID.isValid(id.city)){
			return ObjectID(id.city);
		}
	});

	var listOfStateIds = arr.map(id => {
		if(ObjectID.isValid(id.state)){
			return ObjectID(id.state);
		}

	});

	var listOfCountriesIds = arr.map(id => {
		if(ObjectID.isValid(id.country)){

			return ObjectID(id.country);
		}
	})


	var listOfStateObjectIds = [];

	listOfStateIds.forEach(function(id){
		listOfStateObjectIds.push(ObjectID(id))
	})


	var listOfCountryObjectIds = [];
	listOfCountriesIds.forEach(function(id){
		listOfCountryObjectIds.push(ObjectID(id))
	})


	var listOfCityObjectIds = [];
    listOfCityIds.forEach(function(id) {
        listOfCityObjectIds.push(ObjectID(id));
    }, this);


    var query = {
    	"_id":{"$in":listOfCityObjectIds}
    }

    var allCities = [];
    var allStates = [];
    var allCountries = [];
    CITIES_COLLECTION.find(query,function (cityerror, cities) {
        if (cityerror || !cities) {
            console.log(cityerror);
        }
            	allCities = cities;
          		STATES_COLLECTION.find({"_id":{"$in":listOfStateObjectIds}},function(stateerr,states){

          				if(stateerr || !states){
          					console.log(stateerr);
          				}
          					allStates = states;
          					COUNTRIES_COLLECTION.find({"_id":{"$in":listOfCountryObjectIds}},function(countryerr,countries){


          						if(countryerr || !countries){
          							console.log(countryerr);
          							callback(allCities,allStates,allCountries);
          						}else{

          							allCountries = countries;
          							callback(allCities,allStates,allCountries);

          						}

          					})


          				



          		})



            

    });



  }