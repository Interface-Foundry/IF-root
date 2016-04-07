var builder = require('botbuilder');
var prompts = require('../prompts');
/** Return a LuisDialog that points at our model and then add intent handlers. */
var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=529c8e29-06fe-4342-8bed-59d07b4216f6&subscription-key=f1e70f11452b4b53b73473d3dbb487c4';
var dialog = new builder.LuisDialog(model);
module.exports = dialog;

// * Answer users help requests. We can use a DialogAction to send a static message. 
// dialog.on('Help', builder.DialogAction.send(prompts.helpMessage));

// dialog.onBegin(function (session, args, next) {
//     if (!session.userData.firstRun) {
//         // Send the user through the first run experience
//         session.userData.firstRun = true;
//         session.send(prompts.firstRun);
//         next();
//     } else {
//         next();
//     }
// });

//Drop to initial action
dialog.on('Search', [
    function (session, args, next) {
        console.log('Action Search: ', session.userData)
        var object = builder.EntityRecognizer.findEntity(args.entities, 'object');
        if (!object) {
            // Prompt user to enter a product
            builder.Prompts.text(session, prompts.objectMissing);    
        } else {
            // Pass object to next step.
            next({ response: object.entity });
        }
    },
    function (session, results) {
        console.log('You searched for: ',results.response)
        if (results.response) {
            if (!session.userData.objects) {
                session.userData.objects = [results.response];
            } else {
                session.userData.objects.push(results.response);
            }
            session.sendMessage(prompts.objectFound, { object: results.response });
        } else {
            session.sendMessage(prompts.canceled);
        }
    }
]);

//Drop to modify action
dialog.on('Modify', [
    function (session, args, next) {
        console.log('Action Modify: ', session.userData)
        var modifier = builder.EntityRecognizer.findEntity(args.entities, 'modifier');
        var object = builder.EntityRecognizer.findEntity(args.entities, 'object');
        if (!object && !session.userData.objects) {
            // console.log(1)
            // Prompt user to enter a product
            builder.Prompts.text(session, prompts.objectMissing);    
        } 
        if (!modifier) {
            // console.log(2)
            // Prompt user to enter a product
            builder.Prompts.text(session, prompts.modifierMissing);    
        } 
        if(!object) {
            object = {} 
            object.entity = session.userData.objects[session.userData.objects.length-1]
        }
        // Pass object to next step.
        next({ response: {object: object.entity, modifier: modifier.entity}});
            
    },
    function (session, results) {
        // console.log('Next stage of modifier: ',results.response)
        if (results.response) {
            if (!session.userData.modifiers) {
                session.userData.modifiers = [results.response.modifier];
            } else {
                session.userData.modifiers.push(results.response.modifier);
            }
            if (!session.userData.objects) {
                session.userData.objects = [results.response.object];
            } else {
                session.userData.objects.push(results.response.object);
            }
            session.send(prompts.modifySuccess, { object: results.response.object, modifier: results.response.modifier  });
        } else {
            session.send(prompts.canceled);
        }
    }
]);

dialog.on('Focus', [
    function (session, args, next) {
        console.log('Action Focus: ', session.userData)
        var number= builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
        if (!number) {
            // Prompt user to enter a choice
            builder.Prompts.text(session, prompts.focusMissing);    
        } else {
            // Pass number to next step.
            next({ response: number.entity });
        }
    },
    function (session, results) {
        if (results.response) {
            console.log('You chose to focus on: ',results.response)
        }
    }
]);

dialog.on('Save', [
    function (session, args, next) {
        // See if got the tasks title from our LUIS model.
        console.log('Action Save: ', session.userData, args.entities)
        var number = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
        if (!number) {
            // Prompt user to enter a product
            builder.Prompts.text(session, prompts.saveMissing);    
        } else {
            next({ response: number.entity });
        }
    },
    function (session, results) {
        console.log('You added: ',results.response, ' to cart.')
        if (results.response) {
            if (!session.userData.cart) {
                session.userData.cart = [results.response];
            } else {
                session.userData.cart.push(results.response);
            }
            session.send(prompts.saveSuccess, { object: results.response });
        } else {
            session.send(prompts.canceled);
        }
    }
]);

dialog.on('Checkout', [
    function (session, results) {
        console.log('Action Checkout: ', session.userData)
        if (!session.userData.cart || (session.userData.cart && session.userData.cart.length == 0)) {
            session.send(prompts.cartEmpty);
        } else {
            session.send(prompts.checkoutSuccessful, { object: results.response });
        }
    }
]);

dialog.onDefault(
    function (session, results) {
        console.log('Default Reponse: ', session.userData)
        builder.DialogAction.send("Oops sorry, I didn\'t understand your request")
        // session.send(prompts.defaultResponse);
});

// /** Prompts a user for the title of the task and saves it.  */
// dialog.on('SaveTask', [
//     function (session, args, next) {
//         // See if got the tasks title from our LUIS model.
//         var title = builder.EntityRecognizer.findEntity(args.entities, 'TaskTitle');
//         if (!title) {
//             // Prompt user to enter title.
//             builder.Prompts.text(session, prompts.saveTaskMissing);    
//         } else {
//             // Pass title to next step.
//             next({ response: title.entity });
//         }
//     },
//     function (session, results) {
//         // Save the task
//         if (results.response) {
//             if (!session.userData.tasks) {
//                 session.userData.tasks = [results.response];
//             } else {
//                 session.userData.tasks.push(results.response);
//             }
//             session.send(prompts.saveTaskCreated, { task: results.response });
//         } else {
//             session.send(prompts.canceled);
//         }
//     }
// ]);

// /** Prompts the user for the task to delete and then removes it. */
// dialog.on('FinishTask', [
//     function (session, args, next) {
//         // Do we have any tasks?
//         if (session.userData.tasks && session.userData.tasks.length > 0) {
//             // See if got the tasks title from our LUIS model.
//             var topTask;
//             var title = builder.EntityRecognizer.findEntity(args.entities, 'TaskTitle');
//             if (title) {
//                 // Find it in our list of tasks
//                 topTask = builder.EntityRecognizer.findBestMatch(session.userData.tasks, title.entity);
//             }
            
//             // Prompt user if task missing or not found
//             if (!topTask) {
//                 builder.Prompts.choice(session, prompts.finishTaskMissing, session.userData.tasks);
//             } else {
//                 next({ response: topTask });
//             }
//         } else {
//             session.send(prompts.listNoTasks);
//         }
//     },
//     function (session, results) {
//         if (results && results.response) {
//             session.userData.tasks.splice(results.response.index, 1);
//             session.send(prompts.finishTaskDone, { task: results.response.entity });
//         } else {
//             session.send(prompts.canceled);
//         }
//     }
// ]);

// /** Shows the user a list of tasks. */
// dialog.on('ListTasks', function (session) {
//     if (session.userData.tasks && session.userData.tasks.length > 0) {
//         var list = '';
//         session.userData.tasks.forEach(function (value, index) {
//             list += session.gettext(prompts.listTaskItem, { index: index + 1, task: value });
//         });
//         console.log('***LIST: ',list)
//         session.send(prompts.listTaskList, list);
//     }
//     else {
//         session.send(prompts.listNoTasks);
//     }
// });
