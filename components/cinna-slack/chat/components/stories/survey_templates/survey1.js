//Generic survey that will be able to plug into multiple platforms

var survey1 = {
    'Q1':{
        prompt: 'Hey do you have a moment?',
        answers: [{
            id:'A1',
            label: 'Yes',
            value: 'yes',
            target_q_id: 'Q2'
        },
        { 
            id: 'A2',
            label: 'No',
            value: 'no',
            target_q_id: 'Q3'
        }]
    },
    'Q2':{
        prompt: '??',
        answers: [{
            id: 'A3',
            label: 'Yes',
            value: 'yes',
            target_q_id: 'Q2'
        },
        { 
            id: 'A4',
            label: 'No',
            value: 'no',
            target_q_id: 'Q3'
        }]
    }
}




// var survey1 = [
//   {
//     "text": "We value your feedback and would like to get your input on how to make Kip better! Do you have time for 3 quick questions?",
//     "template_type": "survey-1",
//     "actions": [{
//       "name": "Yes",
//       "text": "Yes",
//       "type": "button",
//       "value": {
//           selected: "yes",
//           story_pointer: 0,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 2",
//       "text": "No",
//       "type": "button",
//       "value": {
//           selected: "no",
//           story_pointer: 0,
//           handler: "story.answer"
//       } 
//     }],
//     "callback_id": "story_19238"
//   },
//   {
//     "text": "How would you feel if you could no longer use Kip?",
//     "template_type": "survey-1",
//     "actions": [{
//       "name": "button 1",
//       "text": "Very disappointed",
//       "type": "button",
//       "value": {
//           selected: "Very disappointed",
//           story_pointer: 1,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 2",
//       "text": "Somewhat disappointed",
//       "type": "button",
//       "value": {
//           selected: "Somewhat disappointed",
//           story_pointer: 1,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 3",
//       "text": "Not disappointed",
//       "type": "button",
//       "value": {
//           selected: "Not disappointed",
//           story_pointer: 1,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 4",
//       "text": "No",
//       "type": "button",
//       "value": {
//           selected: "No Longer Using Kip",
//           story_pointer: 1,
//           handler: "story.answer"
//       } 
//     }],
//     "callback_id": "story_19238"
//   },
//   { 
//     "text": "What makes shopping on Kip the most difficult for you?",
//     "template_type": "survey-1",
//     "actions": [{
//       "name": "button 1",
//       "text": "Unrelated search results",
//       "type": "button",
//       "value": {
//           selected: "Unrelated search results",
//           story_pointer: 2,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 2",
//       "text": "Slow search results",
//       "type": "button",
//       "value": {
//           selected: "Slow search results",
//           story_pointer: 2,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 3",
//       "text": "Wrong price point",
//       "type": "button",
//       "value": {
//           selected: "Wrong price point",
//           story_pointer: 2,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 4",
//       "text": "Lack of integrations",
//       "type": "button",
//       "value": {
//           selected: "Lack of integrations",
//           story_pointer: 2,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 5",
//       "text": "Other",
//       "type": "button",
//       "value": {
//           selected: "Other",
//           story_pointer: 2,
//           handler: "story.answer"
//       } 
//     }],
//     "callback_id": "story_19238"
//   },
//     { 
//     "text": "Would you like early access to new features as a Beta tester?",
//     "template_type": "survey-1",
//     "actions": [{
//       "name": "button 1",
//       "text": "Yes!",
//       "type": "button",
//       "value": {
//           selected: "Yes",
//           story_pointer: 3,
//           handler: "story.answer"
//       } 
//     },
//     {
//       "name": "button 2",
//       "text": "No",
//       "type": "button",
//       "value": {
//           selected: "No",
//           story_pointer: 3,
//           handler: "story.answer"
//       }
//     }],
//     "callback_id": "story_19238"
//   },
// ]

module.exports.survey1 = survey1