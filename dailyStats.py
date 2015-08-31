import pymongo

url = 'mongodb://pikachu.kipapp.co:27017'
#url = 'mongodb://flareon.internal.kipapp.co:27017'
client = pymongo.MongoClient(url)
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


