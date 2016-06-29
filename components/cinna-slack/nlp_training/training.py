from __future__ import print_function
import json
from keras import backend as K
from keras.models import Model
from keras.layers import Input, Dense, Embedding, Dropout, LSTM, merge
from keras.optimizers import RMSprop
from keras.preprocessing.sequence import pad_sequences
from keras.callbacks import TensorBoard, ModelCheckpoint


from data import retrieve_from_prod_db, to_tk, actions_to_codes
from utils import save_model, save_tokenizer

import tensorflow as tf


def model():
    '''full bidirectional'''
    with tf.name_scope('session'):
        sess = tf.Session()
        K.set_session(sess)

    with tf.name_scope('inputs'):
        sequence = Input(shape=(data.shape[1],), dtype='int32')
        embed = Embedding(input_dim=tk.nb_words,
                          output_dim=128,
                          input_length=data.shape[1],
                          mask_zero=True)(sequence)

    with tf.name_scope('forwards'):
        # apply forwards LSTM1
        forwards = LSTM(64, consume_less='gpu', return_sequences=True)(embed)
        # forwards = LSTM(128, consume_less='gpu', return_sequences=True)(forwards)
        # forwards = LSTM(64, return_sequences=True)(forwards)
        forwards = LSTM(64, consume_less='gpu')(forwards)

    with tf.name_scope('backwards'):
        # apply forwards LSTM1
        backwards = LSTM(64, return_sequences=True, consume_less='gpu', go_backwards=True)(embed)
        # backwards = LSTM(128, return_sequences=False)(backwards)
        # backwards = LSTM(64, return_sequences=True)(after_dp)
        backwards = LSTM(64, consume_less='gpu')(backwards)

    with tf.name_scope('merge1'):
        # concat the outputs of the 2 LSTMs
        merged = merge([forwards, backwards], mode='concat', concat_axis=-1)
        after_dp = Dropout(0.5)(merged)

        # apply forwards + backwards LSTM1

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
        log_dir='logs/', histogram_freq=2, write_graph=True)

    mc = ModelCheckpoint(
        filepath='models/latest_model.hdf5',
        verbose=1, save_best_only=True)

    return tb, mc

if __name__ == '__main__':
    pad_length = 20
    df = retrieve_from_prod_db()
    action_codes, ac_dict, rev_ac_dict = actions_to_codes(df)

    tk = to_tk(df)
    data = tk.texts_to_sequences(df.msg.values)
    data = pad_sequences(data, maxlen=pad_length)

    model = model()
    save_model(model)
    print(model.summary())
    # with open('my_dict.json') as f:
    #     my_dict = json.load(f)

# elsewhere...


    tb, mc = get_callbacks()

    save_tokenizer(tk)
    model.fit(data, action_codes,
              validation_split=.2,
              nb_epoch=250,
              batch_size=16,
              verbose=1,
              callbacks=[tb, mc])
