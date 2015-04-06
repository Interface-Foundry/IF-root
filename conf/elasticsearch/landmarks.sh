#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# first kill all things if they exist
curl -XDELETE localhost:9200/_river/landmark_river
curl -XDELETE localhost:9200/if

echo
echo "sleeping for 5s while clean up executes"

sleep 5

# create the index
bash "$DIR"/landmarks/landmarks_index.sh

# create the river
bash "$DIR"/landmarks/landmarks_river.sh

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


