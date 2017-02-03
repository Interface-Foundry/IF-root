#! /bin/sh

_now=$(date +"%m_%d_%Y")

_file_fb="fb_foundry_$_now"
_file_zip_fb="$_file_fb.tar.gz"

_file_slack="slack_foundry_$_now"
_file_zip_slack="$_file_slack.tar.gz"


# mongodb-1-server-1 - 10.142.0.8
# mongodb-beta-server-1 10.142.0.13
mongo_fb="10.142.0.8"
mongo_slack="10.142.0.13"

mkdir -p /home/graham/scripts/tmp_
cd /home/graham/scripts/tmp_

# mongodump -h 10.142.0.8 --db=foundry --out=$_file

# copy prod fb mongodb
mongodump -h $mongo_fb --db=foundry --out=$_file_fb
tar -zcf $_file_zip_fb $_file_fb

# copy prod slack mongodb
mongodump -h $mongo_slack --db=foundry --out=$_file_slack
tar -zcf $_file_zip_slack $_file_slack


# moves old and puts latest in latest
gsutil mv gs://kip-db-dump/latest/*.tar.gz gs://kip-db-dump/old/

gsutil cp $_file_zip_fb gs://kip-db-dump/latest/
gsutil cp $_file_zip_slack gs://kip-db-dump/latest/

cd .. && rm -r tmp_
