var config = require('config');
var exec = require('child_process').execSync;
var moment = require('moment');
var fs = require('fs');

// filename is where we dump to.
// looks like "backup_production_2015-09-07_2"
// where the _2 is an incrementing counter depending on the number of backups already taken today.
var filename_base = 'backup_' + config.env + '_' + moment().format('YYYY-MM-DD');
var filename = filename_base;
var inc = 0;

while (fs.existsSync(filename) || fs.existsSync(filename + '.tar.gz')) {
    filename = filename_base + '_' + (++inc);
}

// host should just be the hostname, no database part.
var host = config.mongodb.backuphost;

// this is execSync
console.log('backup up db, this may take a while');
console.log("backing up", host, "to", filename)
exec('mongodump -d foundry -h ' + host + ' -o ' + filename)
var p2 = exec('tar czf ' + filename + '.tar.gz ' + filename)
var p3 = exec('rm -rf ' + filename)