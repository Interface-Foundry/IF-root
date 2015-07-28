 var urlify = require('urlify').create({
         addEToUmlauts: true,
         szToSs: true,
         spaces: "_",
         nonPrintable: "",
         trim: true
     }),
     q = require('q'),
     db = require('../components/IF_schemas/db'),
     async = require('async');

 module.exports = {
     uniqueId: function(input, collection) {
         var deferred = q.defer();
         var newUnique;
         // console.log('input: ',input, collection)
         urlify(input, function() {
             db[collection].find({
                 'id': input
             }, function(err, data) {
                 if (err) {
                     return deferred.reject(err)
                 }
                 if (data.length > 0) {
                     var uniqueNumber = 1;
                     async.forever(function(next) {
                             var uniqueNum_string = uniqueNumber.toString();
                             newUnique = data[0].id + uniqueNum_string;
                             db[collection].findOne({
                                 'id': newUnique
                             }, function(err, data) {
                                 if (err) {
                                     return deferred.reject(err)
                                 }
                                 if (data) {
                                     uniqueNumber++;
                                     next();
                                 } else {
                                     // console.log('newUnique: ',newUnique)
                                     next('unique!'); // This is where the looping is stopped
                                 }
                             });
                         },
                         function() {
                             deferred.resolve(newUnique)
                         });
                 } else {
                     console.log(input +' is already unique')
                     deferred.resolve(input)
                 }
             });
         });

         return deferred.promise
     }
 }