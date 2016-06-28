import pandas as pd
from pymongo import MongoClient
from keras.preprocessing.text import Tokenizer
from keras.utils import np_utils

import pickle
import string
from os import path


def load_df(foldername='pkls/too_big', filename='messages.pkl', save=True):
    '''
    for training on google cloud
    '''
    client = MongoClient()
    db = client.prod
    cursor = db.messages.find({})
    df = pd.DataFrame(list(cursor))
    if save:
        df.to_pickle(path.join(foldername, filename))
    return df


def combine_smalltalk(df):
    '''there is both smallTalk and smalltalk in actions, possibly others'''
    df['action'] = df.action.str.lower()
    return df


def retrieve_from_prod_db(only_incoming=True, not_null=True, save=True):
    '''
    helper function to munge and explore with pandas
    '''
    pickled_location = path.join('pkls/too_big', 'messages.pkl')

    if path.isfile(pickled_location):
        df = pd.read_pickle(pickled_location)
    else:
        df = load_df()
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


def save_tokenizer(tokenizer, pkl_name='tokenizer.pkl', foldername='pkls'):
    with open(path.join(foldername, pkl_name), 'wb') as f:
        pickle.dump(tokenizer, f)


def load_tokenizer(pkl_name='tokenizer.pkl', foldername='pkls'):
    with open(path.join(foldername, pkl_name), 'rb') as f:
        tokenizer = pickle.load(f)
    return tokenizer


# --------------------------------
# OLD BELOW ----------------------

# def messages_to_words(df):
#     '''
#     '''

#     df.loc[:, 'msg'] = df.loc[:, 'msg'].str.lower()
#     words = df.msg.str.split(' ')
#     word_list = [w for sublist in words.values for w in sublist]
#     return word_list, words,


# def build_dataset(words, vocabulary_size=50000):
#     count = [['UNK', -1]]
#     count.extend(collections.Counter(words).most_common(vocabulary_size - 1))
#     dictionary = dict()
#     for word, _ in count:
#         dictionary[word] = len(dictionary)
#     data = list()
#     unk_count = 0
#     for word in words:
#         if word in dictionary:
#             index = dictionary[word]
#         else:
#             index = 0  # dictionary['UNK']
#             unk_count += 1
#         data.append(index)
#     count[0][1] = unk_count
#     reverse_dictionary = dict(zip(dictionary.values(), dictionary.keys()))
#     return data, count, dictionary, reverse_dictionary


# def words2numbers(words, dictionary):
#     '''
#     '''
#     data = []
#     for row in words:
#         data.append([dictionary[w] for w in row])
#     return data


# def data_for_model():
#     df = retrieve_from_prod_db()
#     # df = dict_to_cols(df)
#     word_list, words, action_codes, action_codes_dictionary, rev_action_codes_dictionary = messages_to_words(df)
#     data, count, dictionary, reverse_dictionary = build_dataset(words)
#     data = words2numbers(word_list.values, dictionary)
#     data = pad_sequences(data, maxlen=50)
#     return data,


# # df = dict_to_cols(df)
# word_list, words, action_codes, action_codes_dictionary, rev_action_codes_dictionary = messages_to_words(
#     df)
# data, count, dictionary, reverse_dictionary = build_dataset(word_list)
# data = words2numbers(words.values, dictionary)
