var request = require('request');
var db = require('../../../db');
var options = require('./status').options;
var async = require('async');
var luminati_request = function (url, proxy, status) {
    return new Promise((resolve, reject)=>{
        var begin= Date.now();
        proxy.request({ 
          url: url,
          headers: {
             'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
             'Accept': 'text/html,application/xhtml+xml',
             'Accept-Language':'en-US,en;q=0.8',
             'Cache-Control':'max-age=0',
             'Connection':'keep-alive'
          }     
        }, function(err, res){
             var end= Date.now();
             var timeSpent=(end-begin)/10000;
            if (err) {
               db.Metrics.log('proxy', { proxy: 'luminati', check: false,request_url: url, delay_ms: timeSpent, success: false, options: options, error: err, status: status})
               reject(err);
            }
            else if (res.body.length > 0 && res.statusCode == 200) {
               db.Metrics.log('proxy', { proxy: 'luminati', check: false, request_url: url, delay_ms: timeSpent, success: true, status: status, options: options})
               resolve(res.body);
            } 
            else {
               // console.log('W')
               db.Metrics.log('proxy', { proxy: 'luminati', check: false,request_url: url, delay_ms: timeSpent, success: false, error: res.statusCode, body: res.body,status: status, options: options})
               reject()
            }
        });
    })
}


var ensured_luminati_request = function (url, proxy, status) {
    return new Promise((resolve, reject)=>{
        var timerStart = Date.now();
        var timerEnd = 30000;
        var fail;
        var elapsedTime;
        var mainErr;
        console.log('\n\n\nstarted ensured_luminati_request...\n\n\n');
        async.doWhilst(
          function(callback) {
             var begin= Date.now();
             proxy.request({ 
              url: url,
              headers: {
                 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
                 'Accept': 'text/html,application/xhtml+xml',
                 'Accept-Language':'en-US,en;q=0.8',
                 'Cache-Control':'max-age=0',
                 'Connection':'keep-alive'
              }    
            }, function(err, res){
               var end= Date.now();
               var timeSpent=(end-begin)/10000;
               db.Metrics.log('proxy', { proxy: 'luminati', check: false,request_url: url, delay_ms: timeSpent, success: false, options: options, error: err, status: status})
                if (err) {
                   fail = err;
                   mainErr = err;
                   setTimeout(function(){
                       console.log('\n\n\ntrying again...\n\n\n');
                      callback()
                   }, 1000);
                }
                else if (res.body.length > 0 && res.statusCode == 200) {
                   db.Metrics.log('proxy', { proxy: 'luminati', check: false, request_url: url, delay_ms: timeSpent, success: true, status: status, options: options})
                   setTimeout(function(){
                    fail = false;
                    callback(null,res.body);
                  }, 1000)
                } 
                else {
                   fail = true;
                   db.Metrics.log('proxy', { proxy: 'luminati', check: false,request_url: url, delay_ms: timeSpent, success: false, error: res.statusCode, body: res.body,status: status, options: options})
                    setTimeout(function(){
                       console.log('\n\n\ntrying again...\n\n\n');
                      callback()
                   }, 1000);
                }
            })
          },
          function() { 
            elapsedTime = Date.now() - timerStart;
            return (fail && ( elapsedTime <= timerEnd)); 
          },
          function (err, res) {
              if (mainErr || err) {
                console.log('\n\n\n\n\n\n\n\n🤖ensured request failed! ', mainErr,'\n\n\n\n\n\n\n\n\n\n');
                return reject(mainErr);
              }
              else if (res) {
                console.log('\n\n\n\n\n\n\n\n\n🤖ensured request SUCCESS!!\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
                return resolve(res);
              }
              else {
                console.log('\n\n\n\n\n\n\n\n🤖ensured request failed! ', mainErr,'\n\n\n\n\n\n\n\n\n\n');
                return reject();
              }
          });
    })
}

module.exports = {
  luminati_request: luminati_request,
  ensured_luminati_request: ensured_luminati_request
}