from __future__ import print_function

import json

import tensorflow as tf
from keras.models import Model
from keras.layers import Input, Dense, Embedding, Dropout, LSTM, merge
from keras.optimizers import RMSprop
# from keras.regularizers import l2
from keras.preprocessing.sequence import pad_sequences
from keras.callbacks import TensorBoard, ModelCheckpoint

from data import retrieve_from_prod_db, to_tk, actions_to_codes
from utils import save_model, save_tokenizer

with open('config/config.json', 'r') as f:
    config = json.load(f)


def model():
    '''full bidirectional LSTM'''
    with tf.name_scope('inputs'):
        sequence = Input(shape=(data.shape[1],), dtype='int32')
        embed = Embedding(input_dim=tk.nb_words,
                          output_dim=256,
                          input_length=data.shape[1],
                          mask_zero=True)(sequence)

    with tf.name_scope('forwards'):
        fw = LSTM(64, consume_less='gpu', return_sequences=True)(embed)
        fw = LSTM(64, consume_less='gpu')(fw)

    with tf.name_scope('backwards'):
        bw = LSTM(64, consume_less='gpu', return_sequences=True, go_backwards=True)(embed)
        bw = LSTM(64, consume_less='gpu')(bw)

    with tf.name_scope('merge1'):
        # concat the outputs of the 2 LSTMs
        merged = merge([fw, bw], mode='concat', concat_axis=-1)
        after_dp = Dropout(0.5)(merged)

    with tf.name_scope('complete_model'):
        # to dense output
        output = Dense(action_codes.shape[1], activation='softmax')(after_dp)
        model = Model(input=sequence, output=output)

    with tf.name_scope('optimizer'):
        rmsprop = RMSprop(lr=0.0001, rho=0.9, epsilon=1e-08)

    with tf.name_scope('model_compiled'):
        model.compile(optimizer=rmsprop,
                      loss='categorical_crossentropy',
                      metrics=['accuracy'])

    return model


def get_callbacks():
    '''returns callbacks to use for training'''
    tb = TensorBoard(
        log_dir='logs/',
        histogram_freq=0,
        write_graph=True)

    mc = ModelCheckpoint(
        filepath='models/latest_model.hdf5',
        verbose=1,
        save_best_only=True)

    return tb, mc

if __name__ == '__main__':

    pad_length = config['pad_length']
    # ac_dict = config['ac_dict']
    # rev_ac_dict = config['rev_ac_dict']

    df = retrieve_from_prod_db()
    action_codes, ac_dict, rev_ac_dict = actions_to_codes(df)

    config['ac_dict'] = ac_dict
    config['rev_ac_dict'] = rev_ac_dict

    tk = to_tk(df)
    data = tk.texts_to_sequences(df.msg.values)
    data = pad_sequences(data, maxlen=pad_length)

    model = model()
    save_model(model)
    print(model.summary())

    tb, mc = get_callbacks()

    save_tokenizer(tk)
    model.fit(data, action_codes,
              validation_split=.2,
              nb_epoch=250,
              batch_size=32,
              verbose=1,
              callbacks=[tb, mc])
