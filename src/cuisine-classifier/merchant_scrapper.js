'use strict'
var _ = require('lodash')
var db  = require('../db')
var co = require('co')
var sleep = require('co-sleep')
var request = require('request-promise')
var api = require('../chat/components/delivery.com/api-wrapper-alt.js')
//var utils = require('./utils')
var address  = '1280 Lexington Ave 10028'


co(function*() {
    //grab zip codes from mongo db and sort by pop in descending order
    var zip_codes = yield db.zipcodes.find({}).sort({'pop':-1})
    for (var i=0;i<1000;i++){
	console.log(i)
	//grab the latitude and longitude for each zipcode
	var longitude = zip_codes[i]['loc']['coordinates'][0]
	var latitude = zip_codes[i]['loc']['coordinates'][1]
	//Ignore anything that is not a number
	if( isNaN(longitude) || isNaN(latitude))
		continue;

	//put laitude and longitude into params object
	var defaultParams = {
  		pickup: false,
  		addr: address,
  		lat:latitude,
  		long:longitude
	}
	co(function*() {
	var res = yield api.searchNearby(defaultParams)
	})
	//sleep to avoid making too many api calls
	yield sleep(10000)
    }

})
