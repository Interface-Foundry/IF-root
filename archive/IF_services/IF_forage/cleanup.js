var async = require('async');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');



//Routinely checks size of image directory and removes images older than 2 weeks
//from: http://stackoverflow.com/questions/19167297/in-node-delete-all-files-older-than-an-hour
async.whilst(
    function () { return true }, 
    function (callback) {
      console.log('Cleaning up temp images...')
        fs.readdir(__dirname + '/temp/', function(err, files) {
          if (files){
            files.forEach(function(file, index) {
              fs.stat(path.join(__dirname + '/temp/', file), function(err, stat) {
                var endTime, now;
                if (err) {
                  return console.error(err);
                }
                now = new Date().getTime();
                endTime = new Date(stat.ctime).getTime() + 30000; //if file is older than 1 minute, remove
                if (now > endTime) {
                    
                  return rimraf(path.join(__dirname + '/temp/', file), function(err) {
                    if (err) {
                      return console.error(err);
                    }
                    console.log('REMOVED FILE!')
                  });
                }
              });
            });
          }
        });

        setTimeout(callback, 100000); // Check every 5 minutes
        
    },
    function (err) {
    }
);

