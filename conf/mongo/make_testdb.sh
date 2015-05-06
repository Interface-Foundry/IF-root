#!/bin/bash

rm -rf dump
rm -f dump.tar.gz

# landmarks in NYC
mongodump -d if -c landmarks -u ifappuser -p $MP --query '{loc:{$near:{$geometry:{type:"Point",coordinates:[-73.9878042,40.7479261]},$maxDistance:20000}},"loc.coordinates.0":{$ne:-74.0059}}'

# users
mongodump -d if -c users -u ifappuser -p $MP --query '{"local.email":/interfacefoundry/}'

# everything else
mongodump -u ifappuser -p $MP -d if -c announcements
mongodump -u ifappuser -p $MP -d if -c contestentries
mongodump -u ifappuser -p $MP -d if -c contests
#mongodump -u ifappuser -p $MP -d if -c instagrams
mongodump -u ifappuser -p $MP -d if -c stickers
mongodump -u ifappuser -p $MP -d if -c styles
#mongodump -u ifappuser -p $MP -d if -c tweets
mongodump -u ifappuser -p $MP -d if -c visits
mongodump -u ifappuser -p $MP -d if -c worldchats

# targz dat shit
tar czvf dump.tar.gz

