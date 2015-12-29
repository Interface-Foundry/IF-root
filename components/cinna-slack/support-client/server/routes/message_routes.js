var Message = require('../models/Message');
var bodyparser = require('body-parser');

module.exports = function(router) {
    router.use(bodyparser.json());

    //query db for messages
    router.get('/messages', function(req, res) {
        Message.find({
            resolved: false
        }, function(err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    msg: 'internal server error'
                });
            }
            // console.log('RETURNED MESSAGES: ',data)
            res.json(data);
        });
    });

    //post a new message to db
    router.post('/newmessage', function(req, res) {
        Message.findOne({
            'source.channel': req.body.source.channel,
            'msg': req.body.msg,
            'resolved': false
        }, function(err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    msg: 'internal server error'
                });
            }
            if (!data) {
                var newMessage = new Message(req.body);
                newMessage.save(function(err, saved) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            msg: 'internal server error'
                        });
                    }
                    res.json(saved);
                })
            }

            if (data) {
                console.log('Message doubled up!')
                res.json(data)
            }
        })
    })

    //resolve existing message in db
    router.post('/resolve', function(req, res) {
        console.log('req.body', req.body)
        Message.findOne({
            'source.channel': req.body.source.channel
        }, function(err, data) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    msg: 'internal server error'
                });
            }
            if (!data) {
                console.log('Message not found.')
                return res.status(500).json({
                    msg: 'internal server error'
                });
            }
            if (data) {
                data.resolved = true
                data.save(function(err, result) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            msg: 'internal server error'
                        });
                    }
                    console.log('Message resolved.')
                    res.json({});
                })
            }
        });
    });
}