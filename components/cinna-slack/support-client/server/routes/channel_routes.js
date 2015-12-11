var Channel = require('../models/Channel');
var bodyparser = require('body-parser');

module.exports = function(router) {
  router.use(bodyparser.json());
  // query db for channel users
  router.get('/channels', function(req, res) {
    Channel.find({'resolved':false},{name: 1, id:1, resolved:1 , _id:0}, function(err, data) {
      if(err) {
        console.log(err);
        return res.status(500).json({msg: 'internal server error'});
      }
      res.json(data);
    });
  });

  // get a specific channel
  router.get('/channels/:id', function(req, res) {

    Channel.find({name: req.params.id}, function(err, data) {
      if(err) {
        console.log(err);
        return res.status(500).json({msg: 'internal server error'});
      }

      res.json(data)
    })
  })

  // post a new user to channel list db
  router.post('/channels/new_channel', function(req, res) {
    Channel.findOne({id: req.body.id}, function(err, data) {
        if(err) {
          console.log(err);
          return res.status(500).json({msg: 'internal server error'});
        }
        if (data) {
          console.log('Channel exists: ',data)
          return res.json(data)
        } else {
              var newChannel = new Channel(req.body);
              newChannel.save(function(err, data) {
                 if (err) {
                     console.log(err);
                      return res.status(500).json({
                    msg: 'internal server error'
                   });
               }
            res.json(data);
           });
        }
      })
  });
}
