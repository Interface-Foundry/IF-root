var _ = require('lodash'),
mongoose = require('mongoose'),
sanitize = require('mongo-sanitize');
landmarkSchema = require('../IF_schemas/landmark_schema.js');

var route = function(searchType, query, res){

  switch(searchType){

    //text search inside bubble
    case 'text':

          var sText = decodeURI(query.textSearch)
          sText = sanitize(sText);
          if (sText){
            sText = sText.replace(/[^\w\s]/gi, ''); //remove all special characters
          }
          else {
            sText = '';
          }

          var sID = sanitize(query.worldID); //sanitize worldID
          if (sID){
            sID = sID.replace(/[^\w\s]/gi, ''); //remove all special characters
          }

          if (sID && sText){

           console.log(sText);

             landmarkSchema.find(
               { parentID: sID, $text : { $search : sText } },
               { score : { $meta: "textScore" } }
             ).
             sort({ score : { $meta : 'textScore' } }).
             exec(function(err, data) {
               if (data){
                   res.send(data);
               }
               else {
                   console.log('no results');
                   res.send({err:'no results'});            
               }
             });

         }
          else {
            res.send({err:'no results'});
          }

    break;

    //category search inside bubble
    case 'category':

       var sCat = decodeURI(query.catName); //removing %20 etc.
       sCat = sanitize(sCat);

       var sID = sanitize(query.worldID); //sanitize worldID
       // if (sID){
       //   sID = sID.replace(/[^\w\s]/gi, ''); //remove all special characters
       // }

       if (sID && sCat){

           landmarkSchema.find({
              parentID: sID,
              category: sCat
           }).
           sort({ 'name' : 'desc' } ). //alphabetical order
           exec(function(err, data) {
             if (data){

               console.log(data);
                 res.send(data);
             }
             else {
                 console.log('no results');
                 res.send({err:'no results'});            
             }
           });

       } 
       else {
         res.send({err:'no results'});
       }

     break;

    //all landmarks in bubble
    case 'all':

      var sID = sanitize(query.worldID); //sanitize worldID
      if (sID){
        sID = sID.replace(/[^\w\s]/gi, ''); //remove all special characters
      }

      if (sID){

          landmarkSchema.find(
            {'parentID': sID }
          ).
          sort({ 'name' : 'desc' } ). //alphabetical order
          exec(function(err, data) {
            if (data){
                res.send(data);
            }
            else {
                console.log('no results');
                res.send({err:'no results'});            
            }
          }); 

      } 
      else {
        res.send({err:'no results'});
      }


    break;
  }




};

module.exports = route