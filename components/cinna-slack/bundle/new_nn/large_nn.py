from sklearn.preprocessing import Normalizer
from sklearn.decomposition import TruncatedSVD
from sklearn.pipeline import make_pipeline
from sklearn.externals import joblib

from keras.models import Sequential, Model
from keras.layers import Dense, Dropout, Input, Embedding
from keras.utils import np_utils

import numpy as np
import pandas as pd
import gzip
import json
import re
from nltk.tokenize import word_tokenize

# set several constants for dealing with large amounts of data
batch_size = 500000
vector_size = 200
hidden_layer_size = 512

# set up dimensionality reduction for large word vectors
svd = TruncatedSVD(vector_size)
normalizer = Normalizer(copy=False)
pipe_it_up = make_pipeline(svd, normalizer)

# set up supporting functions

# preprocess sentences and remove noise making words
def preprocess(s, tokenize_words=False):
    """
    @param s: String to preprocess
    @param tokenize_words: bool

    returns preprocessed sentence

    This function removes random symbols and deals with words that may lead 
    cause noise in the vectorization and have little meaning. The 
    tokenize_words param determines whether to return the sentence as one
    complete string or as an array of words. It defaults to returning the 
    sentence as a string.
    """
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
    """
    This function acts as a wrapper for the preprocessing function. 

    @param row: list of strings that are either a category or a product name
    @param type: String to classify whether to tokenize the row.

    returns the preprocessed row.
    """
    tmp = []
    for x in row:
        if type == 'cat':
            tmp.append(preprocess(x, tokenize_words=False))
        elif type == 'item':
            tmp.append(preprocess(x, tokenize_words=True))
    return tmp

def flatten_lists(l):
    """
    @param l: list of lists

    returns a flattened list.
    For example:
        l = [[1,2,3], [4], [5,6]]
        flatten_lists(l) == [1,2,3,4,5,6]
    """
    return [item for sublist in l for item in sublist]


# set up neural network to predict classifications
def functional_model(input_shape, aux_shape, output_shape):
    """
    @param input_shape: int describing the length of the main input data
    @param aux_shape: int describing the length of the aux input data
    @output_shape: int describing the output length of the neueral network

    returns a neural network with 2 hidden layer with two inputs

    This function generates a neural network with:
        1.) name_input (main input) and aux_input (brand names)
        2.) merged through concatenation
        3.) passed through a standard Dense layer
        4.) passed through another Dense layer
    This network does not have any recurrent or convolutional features and is
    very simple. A ReLU layer was used instead of a sigmoid layer to reduce the
    chance of a diminishing gradient since the ReLU will maintain a constant
    gradient for larger activations.

    The ReLU layer is followed by a softmax layer to provide a probability
    distribution which is useful for classification. In this case, we expect
    the output to be one-hot encoded classes, where a 1 at index i in the ouput
    indicates that the network predicted the data to be in the class 
    corresponding to index i.

    TODO: The aux_input needs to be removed
    """
    name_input = Input(shape=(input_shape,), name='name_input')
    aux_input = Input(shape=(input_shape,), name='aux_input')
    embed_aux = Embedding(aux_shape, 128)(aux_input)
    x = merge([name_input, aux_input], mode='concat')
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.3)(x)
    output = Dense(output_shape, activation='softmax')(x)
    model = Model(input=[name_input, aux_input], output=output)
    return model

# def create_model(input_shape, output_shape):
#     model = Sequential()
#     model.add(Dense(hidden_layer_size, input_dim=input_shape, activation='relu'))
#     model.add(Dense(output_shape, activation='relu'))
#     return model
    
def train_model(model, input_data, aux_input, expected, n_version):
    """
    @param model: theano neural network model
    @param input_data: name data in the form of normalized vectors
    @param aux_input: brand name data in the form of normalized vectors
    @param expected: expected output array of 0s and 1s, where a 1 indicates
        the class corresponding to the index of the 1.
    @param n_version: int of the number of batches that have already passed
        through the neural network

    This function compiles and fits the model to the data. We use categorical
    crossentropy to act as the most subtable loss function for classification
    problems. The optimizer is adam due to it's improvements over standard
    stochastic gradient descent. The model passes through the data passed in 50
    times for fitting.

    After the training, the model is saved.

    This current model only takes in the main input/name_input since the brand
    names did not seem to be helpful.
    """
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    model.fit(input_data, expected, batch_size=128, shuffle=True,
              nb_epoch=50,  verbose=1, 
              validation_split=0.25)
    model.save('./models/categoy_predictor' + str(version) + '.h5')

# fill in empty data
def fill_data(product_dict):
    """
    @param product_dict: dictionary containing the information from the data

    returns the product_dict with values filled in for empty keys for
    consistency.

    Some products in the dataset are missing fields, such as categories.
    These values are filled to make the data easier to process later. Most of 
    the fields are filled with empty strings, lists, or dicts corresponding to
    the expected type. However, the categories field sometimes shares
    information with the salesRank field and can be filled with information 
    from the salesRank.
    """
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
    """
    @param first_line: String containing the first line or data entry
    @param f: the file object to read data from
    @param batch_size: int containing the number of items to read from the file

    returns pandas dataframe with a row for each data entry.

    This function converts the data from the file into a pandas dataframe to
    make the data easier to manipulate and input into the neural network.
    """
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
def embed(vectorizer, df):
    """
    @param vectorizer: A scikit-learn pipeline to convert words to vectors and
        normalize.
    @param df: dataframe containing the names and data.

    returns the vectorized product titles transformed into vectors
    """
    X = vectorizer.transform(df.title_n)
    return pipe_it_up.fit_transform(X).astype('float32')



"""
BELOW:
1.) load in the vectorizer and the data
2.) Read the data in batches and convert into a dataframe
3.) Vectorize the data that is read in
4.) Train the neural network with the vectors

The neural network attempts to predict the category the item belongs to.
NOTE: The current vectorization is broken since the dimensionality reduction
for large amounts of data takes up too much memory.
"""

# load vectorizer model, categories, and brands
vectorizer = joblib.load('vectorizer.pkl')

classes = []
with open('categories.txt', 'r') as f:
    classes = f.read().split('|')

brands = []
with open('brands.txt', 'r') as f:
	brands = f.read().split('|')

# train model
index = 0
classes = list(classes)
brands = list(brands)

with gzip.open('productMeta.txt.gz', 'rb') as f:
    line = f.readline().decode().strip()
    while line:
        # use 250,000 as the batch size
        df, line = to_df(line, f, batch_size)
        
        X_aux = np.zeros(len(df.index), dtype=int)
        for i, brand in enumerate(df.brand):
            X_aux[i] = brands.index(brand)
        
        X = embed(vectorizer, df)
        Y = np.zeros((len(df.index), len(classes)), dtype=bool)
        for i, cats in enumerate(df.categories):
            for cat in cats:
                Y[i, classes.index(cat)] = True
        index += 1
        
        model = functional_model(X.shape[1], len(brands), Y.shape[1])
        #model = create_model(X.shape[1], Y.shape[1])
        train_model(model, X, X_aux, Y, index)

