from __future__ import print_function

import array
from collections import defaultdict

import re
import json
import pickle
from os import path

import numpy as np
import pandas as pd
from gcloud import storage

from keras.models import model_from_json


def gcloud_upload(tk='tokenizer',
                  conf='config',
                  model='latest_model',
                  folder='models'):
    '''upload various stuff to gcloud for downloading when model is built.
    uploads:
        - structure:    model.json
        - architecture: model.hdf5
        - tokenizer:    tokenizer.pkl
    '''
    client = storage.Client()
    bucket = client.get_bucket('kip-nlp-bucket')
    json_blob = bucket.blob(model + '.json')
    conf_blob = bucket.blob(conf + '.json')
    model_blob = bucket.blob(model + '.hdf5')
    token_blob = bucket.blob(tk + '.pkl')

    json_blob.upload_from_filename(path.join(folder, model + '.json'))
    conf_blob.upload_from_filename(path.join(folder, conf + '.json'))
    model_blob.upload_from_filename(path.join(folder, model + '.hdf5'))
    token_blob.upload_from_filename(path.join(folder, tk + '.pkl'))


def save_model(model, gcloud=False, filename='latest_model', folder='models'):
    json_string = model.to_json()
    open(path.join(folder, filename + '.json'), 'w').write(json_string)
    model.save_weights(path.join(folder, filename + '.hdf5'), overwrite=True)


def load_model(filename='latest_model', folder='models'):
    model = model_from_json(open(path.join(folder, filename + '.json')).read())
    model.load_weights(path.join(folder, filename + '.hdf5'))


def save_tokenizer(tokenizer, pkl_name='tokenizer.pkl', foldername='models'):
    with open(path.join(foldername, pkl_name), 'wb') as f:
        pickle.dump(tokenizer, f)


def load_tokenizer(pkl_name='tokenizer.pkl', foldername='models'):
    with open(path.join(foldername, pkl_name), 'rb') as f:
        tokenizer = pickle.load(f)
    return tokenizer


def save_config(config_dict, filename='config', folder='models'):
    with open(path.join(folder, filename + '.json'), 'w') as f:
        json.dump(config_dict, f)


# ---------------------------------
# Glove Functions


def load_glove_vocab(filename):
    vocab = None
    with open(filename) as f:
        vocab = f.read().splitlines()
    dct = defaultdict(int)
    for idx, word in enumerate(vocab):
        dct[word] = idx
    return [vocab, dct]


def load_glove_vectors(filename, vocab):
    """
    Load glove vectors from a .txt file.
    Optionally limit the vocabulary to save memory. `vocab` should be a set.
    """
    dct = {}
    vectors = array.array('d')
    current_idx = 0
    with open(filename, "r", encoding="utf-8") as f:
        for _, line in enumerate(f):
            tokens = line.split(" ")
            word = tokens[0]
            entries = tokens[1:]
            if not vocab or word in vocab:
                dct[word] = current_idx
                vectors.extend(float(x) for x in entries)
                current_idx += 1
        word_dim = len(entries)
        num_vectors = len(dct)
        return [np.array(vectors).reshape(num_vectors, word_dim), dct]


def evaluate_recall(y, y_test, k=1):
    num_examples = float(len(y))
    num_correct = 0
    for predictions, label in zip(y, y_test):
        if label in predictions[:k]:
            num_correct += 1
    return num_correct / num_examples

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
