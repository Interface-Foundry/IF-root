#!/bin/bash

# all you need to do is symnlink the mongod binary you want here

/data/software/mongodb/testdb/mongod -f /data/software/mongodb/testdb/primary.yaml
/data/software/mongodb/testdb/mongod -f /data/software/mongodb/testdb/secondary.yaml
/data/software/mongodb/testdb/mongod -f /data/software/mongodb/testdb/arbiter.yaml

sleep 3

mongo localhost:27017 replset.js
