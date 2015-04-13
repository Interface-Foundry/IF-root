#!/bin/bash

# all you need to do is symnlink the mongod binary you want here

mongod -f /mongodb/conf/primary.yaml
mongod -f /mongodb/conf/secondary.yaml
mongod -f /mongodb/conf/arbiter.yaml

sleep 3

mongo localhost:27017 replset.js
