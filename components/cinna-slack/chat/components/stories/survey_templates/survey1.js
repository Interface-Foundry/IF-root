//Generic survey that will be able to plug into multiple platforms



var survey1 = {
   'Q1':{
       prompt: 'Hi do you have some time for a quick quiz?',
       answers: [{
           label: 'Yes',
           target_q_id: 'Q2A'
       },
       {
           label: 'No',
           target_q_id: 'Q2B'
       }]
   },

   'Q2A':{
       prompt: 'GREAT! Have you used Kip to shop before?',
       answers: [{
           label: 'Yes',
           target_q_id: 'Q3A'
       },
       {
           label: 'No',
           target_q_id: 'Q3B'
       }]
   },

  'Q2B':{
       prompt: 'It’s too bad you’re too busy right now! You could win $100 of free money by taking the quiz later. Can i bug you some other time?',
       answers: [{
           label: '1hr',
           target_q_id: 'false' // redirect to shopping mode & set up reminder alerts
       },
       {
           label: '3hr',
           target_q_id: 'false' 
       },
       {
           label: 'Tomorrow',
           target_q_id: 'false' 
       },
       {
           label: 'Next Week',
           target_q_id: 'false'
       },
       {
           label: 'Never',
           target_q_id: 'false'
       }]
   },

   'Q3A':{
       prompt: 'How often do use Kip?',
       answers: [{
           label: 'Monthly',
           target_q_id: 'Q4A'
       },
       {
           label: 'Bi-Weekly',
           target_q_id: 'Q4A'
       },
       {
           label: 'Weekly',
           target_q_id: 'Q4A'
       },
       {
           label: 'Sometimes',
           target_q_id: 'Q4A'
       },
       {
           label: 'Tried Kip once',
           target_q_id: 'Q3B'
       }]
   },

   'Q3B':{
       prompt: 'Why only once?',
       answers: [{
           label: 'Wrong stores',
           target_q_id: 'Q4B'
       },
       {
           label: 'Too difficult',
           target_q_id: 'Q4C'
       },
       {
           label: 'Team doesn\'t use',
           target_q_id: 'Q4D'
       },
       {
           label: 'Use other system',
           target_q_id: 'Q4E'
       },
       {
           label: 'Other',
           target_q_id: 'Q4E'
       }]
   },
   'Q3C':{
       prompt: 'Why not?',
       answers: [{
           label: 'Wrong stores',
           target_q_id: 'Q4B'
       },
       {
           label: 'Too difficult',
           target_q_id: 'Q4C'
       },
       {
           label: 'Team doesn\'t use',
           target_q_id: 'Q4D'
       },
       {
           label: 'Use other system',
           target_q_id: 'Q4E'
       },
       {
           label: 'Other',
           target_q_id: 'Q4E'
       }]
   },
   'Q4A':{
       prompt: 'Do you use Kip for yourself or your team?',
       answers: [{
           label: 'Myself(Personal)',
           target_q_id: 'Q6A3'
       },
       {
           label: 'My team(Group)',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Both',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Other',
           target_q_id: 'Q6A1'
       }]
   },
   'Q4B':{
       prompt: 'Where do you live?',
       answers: [{
           label: 'East Coast',
           target_q_id: 'Q6A1'
       },
       {
           label: 'West Coast',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Midwest',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Southern Region',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Outside USA',
           target_q_id: 'Q5A'
       }]
   },
   'Q4C':{
       prompt: 'What makes it difficult?',
       answers: [{
           label: 'Slow results',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Wrong results',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Confusing intro',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Other',
           target_q_id: 'Q6A1'
       }]
   },
   'Q4D':{
       prompt: 'What type of office is it?',
       answers: [{
           label: 'Tech',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Media/Advertising',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Non-profit/Interest',
           target_q_id: 'Q6A1'
       },
       {
           label: 'Other',
           target_q_id: 'Q6A1'
       }]
   },
   'Q4E':{
       prompt: 'What does your office normally use for group shopping?',
       answers: [{
           label: 'Talk in person',
           target_q_id: 'Q5B'
       },
       {
           label: 'Email',
           target_q_id: 'Q5B'
       },
       {
           label: 'Approved Vendors',
           target_q_id: 'Q5C'
       },
       {
           label: 'Oracle or SAP',
           target_q_id: 'Q5D'
       },
       {
           label: 'Other',
           target_q_id: 'Q6A1'
       }]
   },
   'Q5A':{
       prompt: 'Where outside the USA are you?',
       answers: [{
           label: 'Europe',
           target_q_id: 'Q6A2'
       },
       {
           label: 'Canada',
           target_q_id: 'Q6A2'
       },
       {
           label: 'South America',
           target_q_id: 'Q6A2'
       },
       {
           label: 'Asia',
           target_q_id: 'Q6A2'
       },
       {
           label: 'Other',
           target_q_id: 'Q6A2'
       }]
   },
   'Q5B':{
       prompt: 'How many people are in your office?',
       answers: [{
           label: '<10',
           target_q_id: 'Q6B'
       },
       {
           label: '<20',
           target_q_id: 'Q6B'
       },
       {
           label: '<50',
           target_q_id: 'Q6A2'
       },
       {
           label: '<100',
           target_q_id: 'Q6A'
       },
       {
           label: '100+',
           target_q_id: 'Q6A'
       }]
   },
   'Q5C':{
       prompt: 'What kinds of vendors?',
       answers: [{
           label: 'Electronics',
           target_q_id: 'Q7'
       },
       {
           label: 'Grocery & Food',
           target_q_id: 'Q7'
       },
       {
           label: 'Stationery Supplies',
           target_q_id: 'Q7'
       },
       {
           label: 'Other',
           target_q_id: 'Q7'
       }]
   },
   'Q5D':{
       prompt: 'How did you find out about the software?',
       answers: [{
           label: 'Other company',
           target_q_id: 'Q7'
       },
       {
           label: 'Came free',
           target_q_id: 'Q7'
       },
       {
           label: 'Search engine',
           target_q_id: 'Q7'
       },
       {
           label: 'Colleague',
           target_q_id: 'Q7'
       }]
   },
   'Q6A1':{
       prompt: 'What do you normally shop for?',
       answers: [{
           label: 'Electronics',
           target_q_id: 'Q7'
       },
       {
           label: 'Drinks & Snacks',
           target_q_id: 'Q7'
       },
       {
           label: 'Home & Personal',
           target_q_id: 'Q7'
       },
       {
           label: 'Stationery',
           target_q_id: 'Q7'
       },
       {
           label: 'Other',
           target_q_id: 'Q7'
       }]
   },
   'Q6A2':{
       prompt: 'What do you normally shop for?',
       answers: [{
           label: 'Electronics',
           target_q_id: 'false'
       },
       {
           label: 'Drinks & Snacks',
           target_q_id: 'false'
       },
       {
           label: 'Home & Personal',
           target_q_id: 'false'
       },
       {
           label: 'Stationery',
           target_q_id: 'false'
       },
       {
           label: 'Other',
           target_q_id: 'false'
       }]
   },
   'Q6A3':{
       prompt: 'What do you normally shop for?',
       answers: [{
           label: 'Electronics',
           target_q_id: 'Q7'
       },
       {
           label: 'Drinks & Snacks',
           target_q_id: 'Q7'
       },
       {
           label: 'Home & Personal',
           target_q_id: 'Q7'
       },
       {
           label: 'Toys & Games',
           target_q_id: 'Q7'
       },
       {
           label: 'Other',
           target_q_id: 'Q7'
       }]
   },
   'Q6B':{
       prompt: 'What kind of office is it?',
       answers: [{
           label: 'Private lease',
           target_q_id: 'Q6A2'
       },
       {
           label: 'Shared private',
           target_q_id: 'Q6A2'
       },
       {
           label: 'Co-working',
           target_q_id: 'Q6A2'
       },
       {
           label: 'Other',
           target_q_id: 'Q6A2'
       }]
   },

  'Q7':{
       prompt: 'What added feature would be most helpful to you?',
       answers: [{
           label: 'Expense reports',
           target_q_id: 'false'
       },
       {
           label: 'Ways to contact plp',
           target_q_id: 'false'
       },
       {
           label: 'Reminders',
           target_q_id: 'false'
       },
       {
           label: 'Saving on costs',
           target_q_id: 'false'
       }]
   }
}


var teamList = [{
    'team_id':'T24V40J07',
    'admins':['U24V1FN13']
}]


// var survey1 = {
//     'Q1':{
//         prompt: 'Hey do you have a moment?',
//         answers: [{
//             label: 'Yes',
//             target_q_id: 'Q2'
//         },
//         { 
//             label: 'No',
//             target_q_id: 'Q3'
//         }]
//     },
//     'Q2':{
//         prompt: '??',
//         answers: [{
//             label: 'Yes',
//             target_q_id: 'Q2'
//         },
//         { 
//             label: 'No',
//             target_q_id: 'Q3'
//         }]
//     }
// }




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
module.exports.teamList = teamList