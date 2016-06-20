import pandas as pd
import re
from pymongo import MongoClient
from gensim.models import Word2Vec
from __future__ import print_function
from easydict import EasyDict as edict

skip_words = ['nan', 'hi', 'Hi', 'hehe', 'hey', 'help']


def retrieve_from_prod_db():
    '''
    helper function to munge and explore with pandas
    '''
    client = MongoClient()
    db = client.prod
    cursor = db.messages.find({})
    return pd.DataFrame(list(cursor))


def retrieve_from_test_db():
    from pymongo import MongoClient
    client = MongoClient()
    db = client.foundry
    cursor = db.messages.find({})
    df = pd.DataFrame(list(cursor))
    return df


def dict_to_cols(df, cols=['source', 'thread']):
    '''
    some columns have dict/json within the rows
    '''
    for c in cols:
        df.join(pd.DataFrame(df.source.to_dict()).T)
    return df


def text_look(df, skip_words=skip_words):
    '''
    removing some results
    '''
    pat = '|'.join(map(re.escape, skip_words))
    df[df.msg.str.contains(pat) == 'False']
    return df


def word_to_v(df, debug_=False):
    # remove
    if debug_:  # debug uses df.text not df.msg
        pass
    else:
        words = df.msg.str.split(' ').values
    # df = df[df.text.str.contains('_debug') == 'False']  # _debug w kip_tester
    words = df.text.str.split(' ').values
    model = Word2Vec(words)
    return model


def array_of_threads(df):
    '''
    incorporate into seqgen later
    creates array of sequential topics
    '''
    pass