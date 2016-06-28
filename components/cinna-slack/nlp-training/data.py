import pandas as pd
from pymongo import MongoClient
import collections
from keras.preprocessing.sequence import pad_sequences
from keras.preprocessing.text import Tokenizer
from keras.utils import np_utils

import pickle
import string


def df_to_pickle():
    '''
    for training on google cloud
    '''
    client = MongoClient()
    db = client.prod
    cursor = db.messages.find({})
    df = pd.DataFrame(list(cursor))
    df.to_pickle('messages.pkl')


def retrieve_from_prod_db(only_incoming=True, not_null=True):
    '''
    helper function to munge and explore with pandas
    '''
    client = MongoClient()
    db = client.prod
    cursor = db.messages.find({})
    df = pd.DataFrame(list(cursor))
    if only_incoming and not_null:
        df = df[(df.incoming == 1) & (df.msg.notnull() == 1)]
    return df


def combine_smalltalk(df):
    df['action'] = df.action.str.lower()

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
    action_codes_dictionary = {}
    rev_action_codes_dictionary = {}
    df['action_codes'] = df['action'].astype('category')
    action_codes = np_utils.to_categorical(df['action_codes'].cat.codes.values)
    i = 0
    for k in df.action_codes.cat.categories:
        action_codes_dictionary[k] = i
        i += 1

    # reverse lookup for action codes
    rev_action_codes_dictionary = {v: k for k,
                                   v in action_codes_dictionary.items()}

    return action_codes, action_codes_dictionary, rev_action_codes_dictionary


def save_tokenizer(tk, pkl_name='tokenizer.pkl'):
    with open(pkl_name, 'wb') as f:
        pickle.dump(tk, f)


def load_tokenizer(pkl_name='tokenizer.pkl'):
    with open(pkl_name, 'rb') as f:
        tokenizer = pickle.load(f)
    return tokenizer


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
