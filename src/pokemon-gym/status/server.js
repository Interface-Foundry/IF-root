'use strict';
var express = require('express')
var app = express()
var os = require('os');
var ifaces = os.networkInterfaces();
var request = require('request');
var run = require('child_process').execSync;

//
// Get this server's ip addresses
//
var ips = []
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      ips.push(ifname + ':' + alias + ' ' + iface.address);
    } else {
      // this interface has only one ipv4 adress
      ips.push(ifname + ': ' + iface.address);
    }
    ++alias;
  });
});
ips = ips.join(', ');

//
// Get server space for various disks
//
function getSpace() {
  var res = run('df -kH', {encoding: 'utf8'});
  console.log(res);
  // TODO mamke the output nice JSON
  var data = res.split('\n').slice(1)
  .filter(function(row) {
    return row[0] === '/';
  })
  .map(function(row) {
    row = row.split(/\s+/);
    console.log(row);
    return {
      mount_point: row[8],
      total: row[1],
      free: row[3]
    }
  })
  return data;
}

//
// CPU usage
//
function getCPU() {
  var res = run('ps -eo pcpu,pid,user,args | sort -k1 -r | head -10', {encoding: 'utf8'})
  console.log(res)
  var data = res.split('\n').slice(1)
  .map(function(row) {
    return row.trim().split(/\s+/)
  })
  .filter(function(row) {
    console.log(row[0], parseFloat(row[0]))
    return parseFloat(row[0]) > 0;
  })
  .map(function(row) {
    return {
      percent: parseFloat(row[0]),
      command: row.slice(3).join(' ')
    }
  })
  return data;
}

//
// Memory usage
//
function getMem() {
  var res = run('ps -eo pmem,pid,user,args | sort -k1 -r | head -10', {encoding: 'utf8'})
  console.log(res)
  var data = res.split('\n').slice(1)
  .map(function(row) {
    return row.trim().split(/\s+/)
  })
  .filter(function(row) {
    console.log(row[0], parseFloat(row[0]))
    return parseFloat(row[0]) > 0;
  })
  .map(function(row) {
    return {
      percent: parseFloat(row[0]),
      command: row.slice(3).join(' ')
    }
  })
  return data;
}

//
// Main route, responds with JSON
//
app.get('/status', function(req, res, next) {
  res.send({
    "@timestamp": (new Date()).toISOString(),
    host: os.hostname(),
    ips: ips,
    drives: getSpace(),
    cpu: getCPU(),
    mem: getMem()
  })
})

if (!module.parent) {
  app.listen(8911, function() {
    console.log('listening on port 8911')
    request('http://localhost:8911/status', function(e, r, b) {
      console.log(b);
    })
  })
} else {
  module.exports = app;
}
