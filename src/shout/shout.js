//Kip Shout 🦃
//Broadcast to all users matching filter

var _ = require('lodash')
var co = require('co')
var request = require('co-request')
var async = require('async')

var shout = require('./shout_help.js')

//yeah yeah tokens in code x_x
var token = 'EAAT6cw81jgoBAHoZBy7E1q1QYqpf2x59I4tWl3N3oV2IKqLeHGxzl91OFupK2UbVE3ZCU9K3aKhbx1aXJ97CaeGnvaNV2ozhgAiRB92YNeXX0Ftrecw0r2B0dGBUgAv6P8FdKF37D6lD5zvvkzNboaYKOUu4GXGZA54eV3jvQZDZD'

// * * GET IDS * * //
// -- production
var ids = shout.ids
// -- testing
//var ids = shout.testIds
// * * * * //

//go through the ids
async.mapSeries(ids, function(userId,callback){

	co(function *() {
	  	var raw = yield request(`https://graph.facebook.com/v2.6/`+userId+`/?access_token=`+token)
	  	var userInfo = JSON.parse(raw.body)
	  		
	  	if(userInfo.locale == 'en_US'){
	  		console.log('🦃 ',userId)
	  		console.log('🦃 ',userInfo.first_name)
	  		console.log('🦃 ',userInfo.locale)

			var body = { 
				"recipient":{"id":userId }, 
				"message":{
				    "attachment":{
				      "type":"template",
				      "payload":{
				        "template_type":"generic",
				        "elements":[
				          {
				            "title":"Drinks with umbrellas! Can't wait for Botsgiving dinner with friends 😊",
				            "image_url":"http://tidepools.co/kip/kip_thanksgiving.png",
				            "subtitle":"         ",
				            "buttons":[
				              {
					            "type":"web_url",
					            "url":"https://m.me/hiponcho?ref=kip-thanksgiving",
					            "title":"Is it cold Poncho?"
				              },
				              {
					            "type":"web_url",
					            "url":"https://m.me/hipmunk",
					            "title":"Find trips Hipmunk"
				              },
				              {
					            "type":"postback",
					            "payload": JSON.stringify({
					                dataId: 'facebook_' + userId,
					                action: 'button_search',
					                text: 'tupperware',
					                ts: Date.now()
					            }),
					            "title":"I need tupperware!"
				              }
				            ]
				          }
				        ]
				      }
				    }
				}
			}

	  		let result = yield request.post({
		        uri: `https://graph.facebook.com/v2.6/me/messages/?access_token=`+token,
		        form: body
		    })

	  		//did the post message work?
		    if(!result.recipient_id && result.message_id){
		    	console.error('FB POST problem: ',result)
		    }else {
		    	console.log('Successfully sent to user')
		    }

	  	}

	  	//done with user, move on to next user
		setTimeout(function () {
		  callback()
		}, 1000) //slow reqs for rate limits

	}).catch(function(err) {
	  console.error(err.stack);
	});

}, function(err, results) {
      //bleh
      console.log('ok we shouted 🦃 🦃 🦃 ... now back to hibernating 🐧 🐧 🐧')
});

