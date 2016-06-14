import pandas as pd
import re
from pymongo import MongoClient
from gensim.models import Word2Vec

skip_words = ['nan', 'hi', 'Hi', 'hehe', 'hey', 'help']


def retrieve_from_prod_db():
    '''
    helper function to munge and explore with pandas
    '''
    client = MongoClient()
    db = client.prod
    cursor = db.messages.find({})
    df_messages = pd.DataFrame(list(cursor))
    df_messages = df_messages.join(
        pd.DataFrame(df_messages.source.to_dict()).T)
    return df_messages


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
