import pymongo
from everyconfig import everyconfig

config = everyconfig('./config')
#url = 'mongodb://flareon.internal.kipapp.co:27017'
client = pymongo.MongoClient(config['mongodb']['url'])
db = client['foundry']


itemCount = db['landmarks'].count({
    'world': False
})
print 'Items:', itemCount

shopCount = db['landmarks'].count({
    'world': True
})
print 'Shops:', shopCount

userCount = db['users'].count({})
print 'Users:', userCount
