#! /bin/sh
# add w crontab -e every day at 1AM:
# 0 1 * * * /bin/bash /home/kip/cronjobs/db_backup.sh

_now=$(date +"%m_%d_%Y")

touch ~/logs/$_now
echo "starting to run" >> ~/logs/$_now

_file_fb="fb_foundry_$_now"
_file_zip_fb="$_file_fb.tar.gz"

_file_slack="slack_foundry_$_now"
_file_zip_slack="$_file_slack.tar.gz"

_file_mint="mint_$_now"
_file_zip_mint="$_file_mint.tar.gz"


# facebook  is: mongodb-1-server-1    - 10.142.0.8
# slack     is: mongodb-beta-server-1 - 10.142.0.13
# mint      is: mongodb-beta-server-1 - 10.142.0.13

mkdir ~/tmp_backups/
cd ~/tmp_backups/

mongo_fb="10.142.0.7"
mongo_slack="10.142.0.14"
mongo_mint="10.142.0.14"
# mongo_fb="35.185.13.168"
# mongo_slack="104.196.21.133"

# mongodump -h 10.142.0.8 --db=foundry --out=$_file

echo "copying all" >> ~/logs/$_now

# copy prod fb mongodb
mongodump --host=$mongo_fb --db=foundry --out=$_file_fb
tar -zcf $_file_zip_fb $_file_fb

# copy prod slack mongodb
mongodump --host=$mongo_slack --db=foundry --out=$_file_slack
tar -zcf $_file_zip_slack $_file_slack

# copy prod mint mongodb
mongodump --host=$mongo_mint --db=mint --out=$_file_mint
tar -zcf $_file_zip_mint $_file_mint


echo "moving files" >> ~/logs/$_now
# moves old and puts latest in latest
gsutil mv gs://kip-db-dump/latest/*.tar.gz gs://kip-db-dump/old/

gsutil cp $_file_zip_fb gs://kip-db-dump/latest/
gsutil cp $_file_zip_slack gs://kip-db-dump/latest/
gsutil cp $_file_zip_mint gs://kip-db-dump/latest/
echo "done" >> ~/logs/$_now

cd ~ && rm -r ~/tmp_backups
