import string
import logging
from os import makedirs, path

import pandas as pd
from pymongo import MongoClient
from keras.preprocessing.text import Tokenizer
from keras.utils import np_utils


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


def load_db(db_name):
    client = MongoClient()
    db = client[db_name]
    cursor = db.messages.find({})
    df = pd.DataFrame(list(cursor))
    return df


def save_df(df, foldername, filename):
    if not path.isdir(foldername):
        makedirs(foldername)
    if path.isfile(path.join(foldername, filename)):
        logging.info('overwriting current saved dataframe')
        df.to_pickle(path.join(foldername, filename))


def load_df(db_name='prod2', save=True):
    '''
    for training
    '''
    df = load_db(db_name=db_name)
    if save:
        save_df(df, foldername='pkls/too_big', filename=db_name + '.pkl')
    return df


def classes_to_weights(df, ac_dict):
    ''' return weights to a dict for use with class imbalance'''
    weight_dict = {}
    weights = df.action.value_counts()
    for c in ac_dict.keys():
        weight_dict[ac_dict[c]] = weights[c]

    return weight_dict


def combine_smalltalk(df):
    '''there is both smallTalk and smalltalk in actions, possibly others'''
    df['action'] = df.action.str.lower()
    return df


def training_data(load_pickled=False,
                  only_incoming=True,
                  not_null=True):
    pass


def retrieve_from_prod_db(only_incoming=True,
                          not_null=True,
                          load_pickeled=False):
    '''
    helper function to munge and explore with pandas
    '''
    pickled_location = path.join('pkls/too_big', 'messages.pkl')

    if load_pickeled and path.isfile(pickled_location):
        df = pd.read_pickle(pickled_location)
    else:

        df = load_df(foldername='pkls/too_big',
                     db_name='prod2',
                     filename='messages.pkl',
                     save=True)

    if only_incoming and not_null:
        df = df[(df.incoming == 1) & (df.msg.notnull() == 1)]
    df = combine_smalltalk(df)
    return df


def base_filter():
    '''from keras but writing here for simplicity
    '''
    f = string.punctuation
    f = f.replace("'", '')
    f += '\t\n'
    return f


def to_tk(df, default_col='msg'):
    '''
    nb_words, number of words to keep.  ~4975 without limit.  limiting to
    remove error
    '''
    tk = Tokenizer(nb_words=4900,
                   filters=base_filter(),
                   lower=True,
                   split=' ',
                   char_level=False)

    tk.fit_on_texts(df[default_col].values)
    return tk


def actions_to_codes(df):
    '''return action codes from
    '''
    dictionary = {}
    rev_dictionary = {}
    df['action_codes'] = df['action'].astype('category')
    action_codes = np_utils.to_categorical(df['action_codes'].cat.codes.values)
    i = 0
    for k in df.action_codes.cat.categories:
        dictionary[k] = i
        i += 1

    # reverse lookup for action codes
    rev_dictionary = {v: k for k, v in dictionary.items()}

    return action_codes, dictionary, rev_dictionary


def dict_to_cols(df, cols=['source', 'thread']):
    '''some columns have dict/json within the rows'''
    for c in cols:
        df.join(pd.DataFrame(df.source.to_dict()).T)
    return df


if __name__ == '__main__':
    df = load_df(save=False)
    df = df[(df.incoming == 1) & (df.msg.notnull() == 1)]
    df = combine_smalltalk(df)

# --------------------------------
# OLD BELOW ----------------------

# word_list, words, action_codes, action_codes_dictionary, rev_action_codes_dictionary = messages_to_words(
#     df)
# data, count, dictionary, reverse_dictionary = build_dataset(word_list)
# data = words2numbers(words.values, dictionary)
