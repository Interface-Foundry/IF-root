from sklearn.externals import joblib

from keras.models import Sequential, Model
from keras.layers import Dense, Dropout, Input, Embedding, merge, Merge
from keras.utils import np_utils

import numpy as np
import pandas as pd
import gzip
import json
import re
from nltk.tokenize import word_tokenize

# set several constants for dealing with large amounts of data
batch_size = 250000
vector_size = 200
hidden_layer_size = 512

# set up supporting functions

# preprocess sentences and remove noise making words
def preprocess(s, tokenize_words=False):
    s = s.lower()
    s = s.replace('-', ' ')
    s = ''.join(x for x in s if x not in [',', '®', ':', '+', '%', '#'])
    s = s.replace('mm', ' mm')
    s = re.sub(r'\([^)]*\)', '', s)
    s = re.sub(r'\[[^)]*\]', '', s)
    s = s.replace('/', ' ')
    s = s.replace('gold edition', 'gold_edition')
    s = s.replace('premium edition', 'premium_edition')
    s = s.replace('standard edition', 'standard_edition')
    s = s.replace('feet', ' feet')
    s = s.strip()
    if tokenize_words:
        stoplist = ['&', 'a', 'and', 'the', 'for', 'of', 'to', 'in', 'into']
        s = [word for word in s.split() if word not in stoplist]
        s = word_tokenize(' '.join(s))
    return s

def normalize_in_list(row, type='cat'):
    tmp = []
    for x in row:
        if type == 'cat':
            tmp.append(preprocess(x, tokenize_words=False))
        elif type == 'item':
            tmp.append(preprocess(x, tokenize_words=True))
    return tmp

def flatten_lists(l):
    return [item for sublist in l for item in sublist]


# set up neural network to predict classifications
"""
def functional_model(input_shape, aux_shape, output_shape):
    name_input = Input(shape=(input_shape,), name='name_input', dtype='float32')
    aux_input = Input(shape=(input_shape,), name='aux_input', dtype='int32')
    
    embed_aux = Embedding(input_dim=aux_shape, output_dim=512, mask_zero=True)(aux_input)
    #x = tt.concatenate([name_input, embed_aux])
    x = Merge([name_input, embed_aux], mode='concat', concat_axis=1)
    
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.3)(x)
    output = Dense(output_shape, activation='softmax')(x)
    
    model = Model(input=[name_input, aux_input], output=output)
    return model
"""

def create_model(input_shape, output_shape):
    model = Sequential()
    model.add(Dense(hidden_layer_size, input_dim=input_shape, activation='relu'))
    model.add(Dropout(0.3))
    model.add(Dense(output_shape, activation='relu'))
    return model
    
def train_model(model, input_data, labels, n_version):
    model.compile(loss='cosine_proximty', optimizer='adam')
    model.fit(input_data, labels, batch_size=128, 
              shuffle=True, nb_epoch=30,  verbose=1, 
              validation_split=0.25)
    model.save('./models/categoy_predictor' + str(version) + '.h5')

# fill in empty data
def fill_data(product_dict):
    fields = {'categories': [],
              'salesRank': {},
              'title': '',
              'related': {},
              'brand': ''}
    if 'categories' in product_dict.keys():
        product_dict['categories'] = product_dict['categories'][0]
    
    missing_keys = [key for key in fields.keys() if key not in product_dict.keys()]
    
    if 'salesRank' not in missing_keys and 'categories' in missing_keys:
        product_dict['categories'] = product_dict['salesRank'].keys()
        missing_keys.remove('categories')
    
    for key in missing_keys:
        product_dict[key] = fields[key]
    
    return product_dict

# convert batch of json lines into a pandas dataframe to work with
def to_df(first_line, f, batch_size):
    df = {}
    line = first_line
    index = 0
    
    while (index < batch_size and line):
        if ('{' in line):
            if line[-1] == ',':
                line = line[:-1]
            df[index] = fill_data(json.loads(line))
            index += 1
            
        line = f.readline().decode().strip()
     
    # make into a pandas dataframe
    df = pd.DataFrame.from_dict(df, orient='index')
    df.drop('imUrl', 1)
    df.drop('price', 1)
    df['title_n'] = df['title'].apply(lambda x: ' '.join(normalize_in_list([x], type='item')[0]))
    
    return (df, line)    

# embed a new batch of product names
def embed(vectorizer, series):
    return vectorizer.transform(series).astype('float32')

# UNNECESSARY FUNCTION BELOW
# not good style to directly
# can fix by returning a large numpy object array containing all of the items
# the array would have shape (batch_size, 5), where 5 is the chosen bundle size
def create_expected_bundle_categories(df, categorizer):
	recommendation_options = ['bought_together', 'also_bought', 'bought_after_viewing', 'also_viewed']
	for index, row in df.iterrows():
		if row['related']:
		options = filter(lambda x: x in recommendation_options, row['related'].keys())
		items = flatten_lists([row['related'][option] for option in options])[:5]
		items_categories = list(map(lambda x: df.loc[df['asin'] == x].categories, items))
		df.loc[index, 'bundle_categories'] = items_categories

# load vectorizers
vectorizer = joblib.load('vectorizer.pkl')
categorizer = joblib.load('category2vec.pkl')


# train model
index = 0

with gzip.open('productMeta.txt.gz', 'rb') as f:
    line = f.readline().decode().strip()
    while line:
        df, line = to_df(line, f, batch_size)
        
        X = embed(vectorizer, df.title_n)
        Y = embed(categorizer, df.categories)
        index += 1
        
        #model = functional_model(X.shape[1], len(brands), Y.shape[1])
        model = create_model(X.shape[1], Y.shape[1])
        train_model(model, X, Y, index)











