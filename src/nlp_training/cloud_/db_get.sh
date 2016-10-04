#! /bin/sh
# backup util to take mongodb and upload to gcloud storage once a week

_now=$(date +"%m_%d_%Y")
_file="foundry_$_now"
_file_zip="$_file.tar.gz"

mkdir -p /home/graham/scripts/tmp_
cd /home/graham/scripts/tmp_

mongodump -h 10.142.0.8 --db=foundry --out=$_file
tar -zcf $_file_zip $_file

# moves old and puts latest in latest
gsutil mv gs://kip-db-dump/latest/*.tar.gz gs://kip-db-dump/old/
gsutil cp $_file_zip gs://kip-db-dump/latest/

cd .. && rm -r tmp_