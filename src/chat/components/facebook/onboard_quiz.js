
var onboarding_quiz = [{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"You arrive in a foreign city, where do you stay?",
            "buttons":[
              {
                "type":"postback",
                "title":"Luxury hotel",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 0
                            })
              },
              {
                "type":"postback",
                "title":"Forest cabin",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 0
                            })
              },
              {
                "type":"postback",
                "title":"Vintage townhouse",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 0
                            })
              }
            ]
          }
        }
    }
},
{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"After unpacking, you get a chance to explore. Where do you go first?",
            "buttons":[
              {
                "type":"postback",
                "title":"Local market",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 1
                            })
              },
              {
                "type":"postback",
                "title":"Explore nature",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 1
                            })
              },
              {
                "type":"postback",
                "title":"Art & Culture",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 1
                            })
              }
            ]
          }
        }
    }
},
{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"Phew! You’ve been out exploring the whole day, how do you treat yourself?",
            "buttons":[
              {
                "type":"postback",
                "title":"Luxurious massage",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 2
                            })
              },
              {
                "type":"postback",
                "title":"New restaurant",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 2
                            })
              },
              {
                "type":"postback",
                "title":"Hanging with locals",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 2
                            })
              }
            ]
          }
        }
    }
},
{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"It’s your last day on the trip, what do you remember most?",
            "buttons":[
              {
                "type":"postback",
                "title":"Feel of the City",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 3
                            })
              },
              {
                "type":"postback",
                "title":"Historical landmarks",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 3
                            })
              },
              {
                "type":"postback",
                "title":"Memories w. friends",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 3
                            })
              }
            ]
          }
        }
    }
}];

module.exports = onboarding_quiz