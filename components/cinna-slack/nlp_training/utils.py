from __future__ import print_function

from keras.models import model_from_json
import pandas as pd
import re
import json
import pickle
from os import path


def save_model(model, filename='latest_model', folder='models'):
    json_string = model.to_json()
    open(path.join(folder, filename + '.json'), 'w').write(json_string)
    model.save_weights(path.join(folder, filename + '.hdf5'), overwrite=True)


def load_model(filename='latest_model', folder='models'):
    model = model_from_json(open(path.join(folder, filename + '.json')).read())
    model.load_weights(path.join(folder, filename + '.hdf5'))


def predict_to_class(text, tokenizer, model, reverse_action_dict):
    '''
    '''
    if type(text) is str:
        text = [text]

    preds = model.predict(pad_sequences(
        tokenizer.texts_to_sequences(text), maxlen=pad_length))

    reverse_action_dict[preds.argmax()]


def save_tokenizer(tokenizer, pkl_name='tokenizer.pkl', foldername='pkls'):
    with open(path.join(foldername, pkl_name), 'wb') as f:
        pickle.dump(tokenizer, f)


def load_tokenizer(pkl_name='tokenizer.pkl', foldername='pkls'):
    with open(path.join(foldername, pkl_name), 'rb') as f:
        tokenizer = pickle.load(f)
    return tokenizer


def save_dict(dictionary, filename, folder='dict_lookups'):
    with open(path.join(folder, filename + '.json'), 'w') as f:
        json.dump(dictionary, f)


# --------------------------------
# OLD BELOW ----------------------


def retrieve_from_test_db():
    '''use to get stuff from test_db, not useful for training keras'''
    from pymongo import MongoClient
    client = MongoClient()
    db = client.foundry
    cursor = db.messages.find({})
    df = pd.DataFrame(list(cursor))
    return df


def dict_to_cols(df, cols=['source', 'thread']):
    '''some columns have dict/json within the rows'''
    for c in cols:
        df.join(pd.DataFrame(df.source.to_dict()).T)
    return df


def text_look(df, skip_words=['hi', 'hey', 'Hi']):
    '''removing some results'''
    pat = '|'.join(map(re.escape, skip_words))
    df[df.msg.str.contains(pat) == 'False']
    return df


def word_to_v(df, debug_=False):
    # remove
    # if debug_:  # debug uses df.text not df.msg
    #     pass
    # else:
    #     words = df.msg.str.split(' ').values
    # words = df.text.str.split(' ').values
    # model = Word2Vec(words)
    # return model
    pass


def array_of_threads(df):
    '''
    incorporate into seqgen later
    creates array of sequential topics
    '''
    pass
