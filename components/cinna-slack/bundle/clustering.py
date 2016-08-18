
from sklearn.cluster import AgglomerativeClustering, KMeans, MiniBatchKMeans
from sklearn.preprocessing import Normalizer
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline

from nltk.tokenize import word_tokenize
from pymongo import MongoClient
import numpy as np

import pandas as pd
from keras.models import Sequential
from keras.layers import Dense, LSTM, Dropout
from keras.utils import np_utils
from gensim.models import Word2Vec

# 
rows = 50
cols = 50

# helper functions
def preprocess(s, tokenize_words=False):
    s = s.lower()
    s = s.replace(' - ', ' ')
    s = ''.join(x for x in s if x not in ['(', ')', '[', ']', ',', '®', ':', '-', '+'])
    s = s.replace(' mm', 'mm')
    s = s.replace('/', ' ')
    s = s.replace('gold edition', 'gold_edition')
    s = s.replace('premium edition', 'premium_edition')
    s = s.replace('standard edition', 'standard_edition')
    if tokenize_words:
        stoplist = ['&', 'a', 'and', 'the', 'for', 'of', 'to', 'in', 'into', 'bluray']
        s = [word for word in s.split() if word not in stoplist]
        s = word_tokenize(' '.join(s))
    return s

def normalize_in_list(row, type='cat'):
    tmp = []
    for x in row:
        if type == 'cat':
            tmp.append(preprocess(x, tokenize_words=False))
        if type == 'item':
            tmp.append(preprocess(x, tokenize_words=True))
    return tmp

def flatten_lists(l):
    return [item for sublist in l for item in sublist]

def shuffle_in_unison(a, b):
    rng_state = np.random.get_state()
    np.random.shuffle(a)
    np.random.set_state(rng_state)
    np.random.shuffle(b)

# load data
client = MongoClient()
db = client.amazonData
products = db.products
data = products.find({'asin': {'$exists': True}, 'name': {'$exists': True}})
N = products.count({'asin': {'$exists': True}, 'name': {'$exists': True}})
n_clusters = int(N / 2.5)

df = pd.DataFrame(list(data))

df['name_n'] = df['name'].apply(lambda x: normalize_in_list([x], type='item'))
df['boughtAfterView_n'] = df['boughtAfterView'].apply(lambda x: normalize_in_list(x, type='item'))
df['frequentlyBought_n'] = df['boughtAfterView'].apply(lambda x: normalize_in_list(x, type='item'))
df['category_n'] = df['category'].apply(lambda x: normalize_in_list(x, type='cat'))
df['to_embed'] = df.apply(lambda row: sum(row['name_n'] + [flatten_lists(row['frequentlyBought_n'])] + [flatten_lists(row['boughtAfterView_n']) + row['category_n']],[]), axis=1)
df['to_embed2'] = df['to_embed'].apply(lambda x: ' '.join(x))
df['_embed'] = df.apply(lambda row: sum(row['name_n'],[]), axis=1)
df['_embed'] = df['_embed'].apply(lambda x: ' '.join(x))


vectorizer = TfidfVectorizer(max_df=0.5, 
                             max_features=None, 
                             stop_words='english', 
                             use_idf=True)
X = vectorizer.fit_transform(df.to_embed2)

svd = TruncatedSVD(50)
normalizer = Normalizer(copy=False)
pipe_it_up = make_pipeline(svd, normalizer)
X2 = pipe_it_up.fit_transform(X)

#km = MiniBatchKMeans(n_clusters=21500, max_iter=10, n_init=1, verbose=2)
km = KMeans(n_clusters=n_clusters, max_iter=10, n_init=1, verbose=2)
km.fit(X2)

df['predicted_cluster'] = km.predict(X2)

#print(df[['name', 'predicted_cluster']].head(10))

print(df.loc[df['predicted_cluster'] == 0])
print(df.loc[df['predicted_cluster'] == 1])
print(df.loc[df['predicted_cluster'] == 2])


# set up training data
X = vectorizer.fit_transform(df._embed)
Y = np_utils.to_categorical(df.predicted_cluster, n_clusters)
N = X.shape[0]

# apply same transform, but with 200 features instead this time
svd = TruncatedSVD(50)
normalizer = Normalizer(copy=False)
pipe_it_up = make_pipeline(svd, normalizer)
X = pipe_it_up.fit_transform(X)

shuffle_in_unison(X,Y)

X_train = X[:N * 0.75]
X_test = X[N * 0.75:]
Y_train = Y[:N * 0.75]
Y_test = Y[N * 0.75:]

# build network
model = Sequential()
model.add(Dense(512, input_shape=(50,), activation='relu'))
#model.add(Dropout(0.3))
#model.add(Dense(512, activation='relu'))
model.add(Dropout(0.3))
model.add(Dense(n_clusters, activation='softmax'))

# compile network
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# train the model
model.fit(X_train, Y_train, batch_size=128, 
          nb_epoch=30,  verbose=1, 
          validation_data=(X_test, Y_test))

# evaluate the model
score = model.evaluate(X_test, Y_test)
print('Test score:', score[0])
print('Test accuracy:', score[1])
