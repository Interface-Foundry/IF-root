#!/bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# kill the connector
sudo killall mongo-connector
rm -f oplog.timestamp

set -e
# first kill all things if they exist
curl -XDELETE localhost:9200/foundry

echo
echo "sleeping for 5s while clean up executes"

sleep 5

# create the elasticsearch index with a geo mapping
bash "$DIR"/landmarks/landmarks_index.sh

# initialize the connector
nohup mongo-connector -c "$DIR"/landmarks/mongo-connector-config-localhost.json > "$DIR"/mongo-connector.log 2>&1 &

echo
echo "sleeping for 10s while the river initializes"

sleep 10

# test the index
bash "$DIR"/landmarks/reglartest.sh

echo
echo "did the regular test seem to work?  ctrl+c if not..."

sleep 5

bash "$DIR"/landmarks/geotest.sh

echo
echo "did the geo test seem to work?"

echo "done"


