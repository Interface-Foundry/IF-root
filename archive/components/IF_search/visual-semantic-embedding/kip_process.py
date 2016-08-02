import tools, evaluation

import pymongo
from bson.binary import Binary
from everyconfig import everyconfig
config = everyconfig('../../../config')
client = pymongo.MongoClient(config['mongodb']['url'])
db = client['foundry']
items = db['landmarks'].find({
    'world': False,
    'description': {
        '$exists': True
    },
    'name': {
        '$exists': True
    }
}, limit=10000, projection=['description', 'name'])

words = map(lambda i: ((i['name'] + ' ' + i['description']).lower()), items)


#
# load the model
#
model = tools.load_model()

sentence_vectors = tools.encode_sentences(model, words, verbose=True)

print sentence_vectors.shape

from sklearn.neighbors import BallTree

print 'building ball tree'
tree = BallTree(sentence_vectors)

print 'finding nearest neighbor for ' + words[1]
dist, ind = tree.query(sentence_vectors[1], k=3)
print ind

print 'was ' + words[ind[0][0]]


queryText = 'fairy tale'
print 'querying: ' + queryText
queryVector = tools.encode_sentences(model, [queryText], verbose=True)
print queryVector.shape
dist, ind = tree.query(queryVector, k=3)
print 'was ' + words[ind[0][0]]

