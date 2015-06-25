'use strict';

var express = require('express'),
  router = express.Router(),
  landmark = require('../IF_schemas/landmark_schema.js'),
  _ = require('underscore'),
  shapefile = require('shapefile'),
  request = require('request'),
  redisClient = require('../../redis.js');

var googleAPI = 'AIzaSyAj29IMUyzEABSTkMbAGE-0Rh7B39PVNz4';

//Get item given an item ID
router.get('/:id', function (req, res, next) {
  landmark.findById(req.params.id, function (err, item) {
    if (err) {
      err.niceMessage = 'No no, item no here.';
      return next(err);
    }

    res.send(item);
  });
});

//Create a new item
router.post('/', function (req, res, next) {
  if (!req.user) {
    return next('You must log in first');
  }

  var newitem = new landmark();
  var loc = {
    type: 'Point',
    coordinates: []
  };
  loc.coordinates.push(parseFloat(req.body.lat));
  loc.coordinates.push(parseFloat(req.body.lon));
  newitem.world = false;
  newitem.ownerUserName = req.user.name;
  newitem.ownerUserId = req.user.profileID;
  newitem.ownerMongoId = req.user._id;
  //s3 imgURL will be sent from post body
  newitem.itemImageURL = req.body.imgURL;
  var item = _.extend(newitem, req.body);
  //Save item
  item.save(function (err, item) {
    if (err) {
      err.niceMessage = 'Could not save item';
      return next(err);
    }
    redisClient.rpush('snaps', item._id, function (err, reply) {
      if (err) {
        err.niceMessage = 'Could not save item';
        err.devMessage = 'REDIS QUEUE ERR';
        return next(err);
      }
      console.log('item added to redis snaps queue', reply);
      console.log('created item is..', item);
      res.send(item)
    });

  });
});


//Update an item
router.put('/:id', function (req, res, next) {
  if (req.user) {
    landmark.findOne({
      id: req.params.id
    }, function (err, result) {
      if (err) {
        err.niceMessage = 'No no, item no here.';
        return next(err);
      }

      if (result && req.user._id == result.ownerMongoId) { //Merge existing item with updated object from frontend
        var item = _.extend(result, req.body);
        //Save item
        item.save(
          function (err, item) {
            if (err) {
              err.niceMessage = 'Could not update item';
              return next(err);
            }
            console.log('updated item is..', item);
            res.send(item)
          })
      } else {
        console.log('you are not authorized...stand down..');
        return next('You are not authorized to edit this item');
      }
    })
  } else {
    console.log('you are not authorized...stand down..');
    return next('You must log in first.');
  }
});

//delete an item
router.post('/:id/delete', function (req, res, next) {
  if (req.user) {
    landmark.findOne(req.params.id, function (err, item) {
      if (err) {
        err.niceMessage = 'No no, item no here.';
        return next(err);
      }

      if (req.user._id == result.ownerMongoId) {
        //Delete entry
        item.remove(function (err) {
          if (err) {
            err.niceMessage = 'Could not delete item';
            return next(err);
          }
          res.sendStatus(200);
          console.log('deleted!')
        })
      } else {
        console.log('you are not authorized...stand down..');
        return next('You are not authorized to delete this item');
      }

    });
  } else {
    console.log('you are not authorized...stand down..');
    return next('You must log in first.');
  }
});

module.exports = router;