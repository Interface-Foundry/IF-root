import pandas as pd
from pymongo import MongoClient
import collections
from keras.preprocessing.sequence import pad_sequences
from keras.utils import np_utils


def retrieve_from_prod_db():
    '''
    helper function to munge and explore with pandas
    '''
    client = MongoClient()
    db = client.prod
    cursor = db.messages.find({})
    return pd.DataFrame(list(cursor))


def messages_to_words(df):
    '''
    '''
    # remove Nan stuff and not incoming
    df = df[(df.incoming == True) & (df.msg.isnull() == False)]

    df['action_codes'] = df['action'].astype('category').cat.codes
    action_codes = np_utils.to_categorical(df.action_codes.values)

    df.loc[:, 'msg'] = df.loc[:, 'msg'].str.lower()
    words = df.msg.str.split(' ')
    word_list = [w for sublist in words.values for w in sublist]
    return word_list, words, action_codes


def build_dataset(words, vocabulary_size=50000):
    count = [['UNK', -1]]
    count.extend(collections.Counter(words).most_common(vocabulary_size - 1))
    dictionary = dict()
    for word, _ in count:
        dictionary[word] = len(dictionary)
    data = list()
    unk_count = 0
    for word in words:
        if word in dictionary:
            index = dictionary[word]
        else:
            index = 0  # dictionary['UNK']
            unk_count += 1
        data.append(index)
    count[0][1] = unk_count
    reverse_dictionary = dict(zip(dictionary.values(), dictionary.keys()))
    return data, count, dictionary, reverse_dictionary


def words2numbers(words, dictionary):
    '''
    '''
    data = []
    for row in words:
        data.append([dictionary[w] for w in row])
    return data


def data_for_model():
    df = retrieve_from_prod_db()
    # df = dict_to_cols(df)
    words, word_list, targets = messages_to_words(df)
    data, count, dictionary, reverse_dictionary = build_dataset(words)
    data = words2numbers(word_list.values, dictionary)
    data = pad_sequences(data, maxlen=50)
    return data, targets
