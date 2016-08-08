from gensim.models import Word2Vec
from keras.layers import Input, Dense, LSTM, merge, Dropout
from keras.models import Model, Sequential
from pymongo import MongoClient
from nltk.tokenize import word_tokenize
import numpy as np

client = MongoClient()
db = client.amazonData
products = db.products

data = products.find({'asin': {'$exists': True}, 'name': {'$exists': True}})

data = [("ITEM_" + product['asin'], product['name'], product['frequentlyBought'], product['boughtAfterView'], product['category'], product['alsoBought']) for product in data]
# [0] is asin
# [1] is name
# [2] is frequentlyBought
# [3] is boughtAfterView
# [4] is category
# [5] is alsoBought

# normalization/preprocess
def preprocess(s):
    s = s.lower()
    s = s.replace(' - ', ' ')
    s = ''.join(x for x in s if x not in ['(', ')', '[', ']', ',', '®', ':', '-', '+'])
    s = s.replace(' mm', 'mm')
    s = s.replace('/', ' ')
    s = s.replace('gold edition', 'gold_edition')
    s = s.replace('premium edition', 'premium_edition')
    s = s.replace('standard edition', 'standard_edition')
    stoplist = ['&', 'a', 'and', 'the', 'for', 'of', 'to', 'in', 'into']
    s = [word for word in s.split() if word not in stoplist]
    return word_tokenize(' '.join(s))

sentences = [preprocess(d[1]) + preprocess(' '.join(d[2])) for d in data]

# set up a dict for converting names to ASINs
names_dict = {}
for d in data:
    if len(d[1]) > 90:
        names_dict[d[1][:91]] = d[0]
    else:
        names_dict[d[1]] = d[0]

# create sentences using the frequently ASINs
other_sentences = []
for d in data:
    tmp = []
    if d[2]:
        for fb in d[2]:
            if len(fb) > 90:
                if(fb[:91] in names_dict):
                    tmp.append(names_dict[fb[:91]])
            elif fb in names_dict:
                tmp.append(names_dict[fb])
        if tmp:
            other_sentences.append([d[0]] + tmp)
    else:
        other_sentences.append([d[0]])

# set up vector spaces
word_space = Word2Vec(sentences, min_count=4)
item_space = Word2Vec(other_sentences, min_count=1)

N = len(data)

# shape of at most 15 words with in 100-tuple embedding
# create model
model = Sequential()
model.add(LSTM(128, input_shape=(20, 100)))
model.add(Dropout(0.3))
model.add(Dense(512, activation='relu'))
model.add(Dropout(0.25))
model.add(Dense(512, activation='sigmoid'))
model.add(Dropout(0.5))
model.add(Dense(100, activation='softmax'))

# compile model
# categorical crossentropy since this is a multi class classification problem
model.compile(optimizer='rmsprop',
              loss='cosine_proximity')


train_data = np.zeros((N, 20, 100))
train_labels = np.zeros((N, 1, 100))

for i in range(N):
    train_labels[i, 0] = item_space[data[i][0]]
    words = preprocess(data[i][1])
    for j, word in enumerate(words):
        train_data[i, j] = word_space[word]

model.fit(train_data, train_labels, nb_epoch=30, batch_size=128)
