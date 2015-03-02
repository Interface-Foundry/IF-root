var _ = require('underscore'),
mongoose = require('mongoose'),
landmarkSchema = require('../IF_schemas/landmark_schema.js'),
contestSchema = require('../IF_schemas/contest_schema.js'),
Q = require('q');



var route = function(imgUpload, uploadContents, userID){


	if (userID){
		checkEntryValid(userID, uploadContents.userLat, uploadContents.userLon, uploadContents.userTime, uploadContents.worldID, function(response){
			if (response){
				var validEntry = true;
				
			}
			else {
				var validEntry = false;
			}
			saveEntry(validEntry, imgUpload, uploadContents, userID);
		});
	}




	function checkEntryValid(userID, userLat, userLon, userTime, worldID, callback){
		landmarkSchema.findById(worldID, function(err, lm) {
			if(err){
				callback(false);
			}
			getDistanceFromLatLonInKm(lm.loc.coordinates[1],lm.loc.coordinates[0],userLat,userLon, function(distance){
				if (distance < 0.15){ //within 150m 
					callback(true);
				}
				else { //outside 150m
					callback(false);
				}
			});
		}); 
	}


	function saveEntry(validEntry, imgUpload, uploadContents, userID){
		  var cs = new contestSchema({
		    worldID: req.body.worldID
		  });

		  //logged in
		  if (req.user){
		    if(req.user._id){
		      cs.userID = req.user._id;
		    }
		  }

		  if (req.body.userName){
		    cs.userName = req.body.userName;
		  }

		  cs.save(function (err, data) {
		      if (err){
		          console.log(err);
		          res.send(err);
		      }
		      else {
		          res.status(200).send([data]);
		      }
		  });
	}


	//distance between two latlng
	function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2,callback) {
	  var R = 6371; // Radius of the earth in km
	  var dLat = deg2rad(lat2-lat1);  // deg2rad below
	  var dLon = deg2rad(lon2-lon1); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  callback(d);
	}

	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	}


	// }
	// else {
	//   res.status(200).send(['need worldID to save visit']);
	// }


  // landmarkSchema.find(
  //     { $text : { $search : sText } },
  //     { score : { $meta: "textScore" } }
  //   ).
  //   sort({ score : { $meta : 'textScore' } }).
  //   limit(50).
  //   exec(function(err, data) {
  //     if (data){
  //         res.send(data);
  //     }
  //     else {
  //         console.log('no results');
  //         res.send({err:'no results'});            
  //     }
  //   });

};

module.exports = route