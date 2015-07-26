import boto3
import pymongo
from subprocess import call

# wow such synchronous code much easier


#
# AWS
#
bucketName = 'if.kip.apparel.images'
bucketUrlPrefex = 'https://s3.amazonaws.com/' + bucketName + '/'
s3 = boto3.resource('s3')

cmd_template = "convert $SRC -resize 640X640> -size 640X640 xc:white +swap -gravity center -composite out.jpg"


#
# Mongo
#
client = pymongo.MongoClient()
db = client['foundry']
landmarks = db['landmarks']


done = False
while not done:
    item = landmarks.find_one({
        'world': False,
        'source_shoptiques_item.images': {'$exists': True},
        'loc': {
            '$near': {
                '$geometry': {
                    'type': 'Point',
                    'coordinates': [ -77.0433437 , 38.9095334 ]
                },
                '$maxDistance': 10000
            }
        }})
    if not item:
        done = True
        continue

    print item['parent']['id'] + ' - ' + item['name']

    for image in item['source_shoptiques_item']['images']:
        key = item['parent']['id'] + '/' + image.split('/').pop()
        newUrl = bucketUrlPrefex + key

        # convert the remote image to 640x640 "out.jpg"
        command = cmd_template.replace('$SRC', image).split(' ')
        ret = call(command)

        # if the conversion fails, just keep on keepin' on
        if not ret == 0:
            continue

        # send to S3
        s3.Object(bucketName, key).put(Body=open('out.jpg', 'rb'))
    # debugging
    done = True


print "Finished"