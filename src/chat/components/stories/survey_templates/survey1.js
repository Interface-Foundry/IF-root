//Generic survey that will be able to plug into multiple platforms


var survey1 = [
  {
    "text": "We value your feedback and would like to get your input on how to make Kip better! Do you have time for 3 quick questions?",
    "template_type": "survey-1",
    "actions": [{
      "name": "button 1",
      "text": "Button 1",
      "type": "button",
      "value": {
          selected: "yes",
          story_pointer: 0,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 2",
      "text": "No",
      "type": "button",
      "value": {
          selected: "no",
          story_pointer: 0,
          handler: "story.answer"
      } 
    }],
    "callback_id": "story_19238"
  },
  {
    "text": "How would you feel if you could no longer use Kip?",
    "template_type": "survey-1",
    "actions": [{
      "name": "button 1",
      "text": "Very disappointed",
      "type": "button",
      "value": {
          selected: "Very disappointed",
          story_pointer: 1,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 2",
      "text": "Somewhat disappointed",
      "type": "button",
      "value": {
          selected: "Somewhat disappointed",
          story_pointer: 1,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 3",
      "text": "Not disappointed",
      "type": "button",
      "value": {
          selected: "Not disappointed",
          story_pointer: 1,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 4",
      "text": "No",
      "type": "button",
      "value": {
          selected: "No Longer Using Kip",
          story_pointer: 1,
          handler: "story.answer"
      } 
    }],
    "callback_id": "story_19238"
  },
  { 
    "text": "What makes shopping on Kip the most difficult for you?",
    "template_type": "survey-1",
    "actions": [{
      "name": "button 1",
      "text": "Unrelated search results",
      "type": "button",
      "value": {
          selected: "Unrelated search results",
          story_pointer: 2,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 2",
      "text": "Slow search results",
      "type": "button",
      "value": {
          selected: "Slow search results",
          story_pointer: 2,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 3",
      "text": "Wrong price point",
      "type": "button",
      "value": {
          selected: "Wrong price point",
          story_pointer: 2,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 4",
      "text": "Lack of integrations",
      "type": "button",
      "value": {
          selected: "Lack of integrations",
          story_pointer: 2,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 5",
      "text": "Other",
      "type": "button",
      "value": {
          selected: "Other",
          story_pointer: 2,
          handler: "story.answer"
      } 
    }],
    "callback_id": "story_19238"
  },
    { 
    "text": "Would you like early access to new features as a Beta tester?",
    "template_type": "survey-1",
    "actions": [{
      "name": "button 1",
      "text": "Yes!",
      "type": "button",
      "value": {
          selected: "Yes",
          story_pointer: 3,
          handler: "story.answer"
      } 
    },
    {
      "name": "button 2",
      "text": "No",
      "type": "button",
      "value": {
          selected: "No",
          story_pointer: 3,
          handler: "story.answer"
      }
    }],
    "callback_id": "story_19238"
  },
]



// var survey1 = [{
//     "message":{
//         "attachment":{
//           "type":"template",
//           "template_type":"feedback-intro",
//           "text":"We value your feedback and would like to get your input on how to make Kip better! Do you have time for a 3 quick questions?",
//           "actions": [
//                 {
//                     "name": "no",
//                     "text": "No",
//                     "type": "button",
//                     "value": "no"
//                 },
//                 {
//                     "name": "yes",
//                     "text": "Yes",
//                     "type": "button",
//                     "value": "yes"
//                 }
//           ]
//         }
//     },

//     "message":{
//         "attachment":{
//           "type":"template",
//           "payload":{
//             "template_type":"button",
//             "text":"How would you feel if you could no longer use Kip?",
//             "buttons":[
//               {
//                 "type":"postback",
//                 "title":"A. Very disappointed",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 0,
//                                 story_pointer: 0
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"B. Somewhat disappointed",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 1,
//                                 story_pointer: 0
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"C. Not disappointed (It isn’t really that useful)",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 2,
//                                 story_pointer: 0
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"D. N/A (I no longer use Kip)",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 3,
//                                 story_pointer: 0
//                             })
//               }
//             ]
//           }
//         }
//     }
// },
// {
//     "message":{
//         "attachment":{
//           "type":"template",
//           "payload":{
//             "template_type":"button",
//             "text":"What other services do you use to perform group shopping?",
//             "buttons":[
//               {
//                 "type":"postback",
//                 "title":"A. Amazon",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 2,
//                                 story_pointer: 1
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"B. Walmart, Target, etc",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 0,
//                                 story_pointer: 1
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"C. Delivery.com",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 3,
//                                 story_pointer: 1
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"D. Jet.com",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 4,
//                                 story_pointer: 1
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"E. Other",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 5,
//                                 story_pointer: 1
//                             })
//               }
//             ]
//           }
//         }
//     }
// },
// {
//     "message":{
//         "attachment":{
//           "type":"template",
//           "payload":{
//             "template_type":"button",
//             "text":"What makes shopping on Kip the most difficult for you?",
//             "buttons":[
//               {
//                 "type":"postback",
//                 "title":"A. Unrelated search results",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 0,
//                                 story_pointer: 2
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"B. Slow search results",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 1,
//                                 story_pointer: 2
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"C. Wrong price point",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 2,
//                                 story_pointer: 2
//                             })
//               }
//               {
//                 "type":"postback",
//                 "title":"D. Not enough integration",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 3,
//                                 story_pointer: 2
//                             })
//               }
//               {
//                 "type":"postback",
//                 "title":"E. Other",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 4,
//                                 story_pointer: 2
//                             })
//               },
//             ]
//           }
//         }
//     }
// },
// {
//     "message":{
//         "attachment":{
//           "type":"template",
//           "payload":{
//             "template_type":"button",
//             "text":"Would you like early access to new features as a Beta tester? ",
//             "buttons":[
//               {
//                 "type":"postback",
//                 "title":"Yes",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 0,
//                                 story_pointer: 3
//                             })
//               },
//               {
//                 "type":"postback",
//                 "title":"No",
//                 "payload": JSON.stringify({
//                                 dataId: 'zzzz',
//                                 object_id: 'zzzz',
//                                 action: "story.answer",
//                                 selected: 1,
//                                 story_pointer: 3
//                             })
//               },
//             ]
//           }
//         }
//     }
// }];

module.exports.survey1 = survey1