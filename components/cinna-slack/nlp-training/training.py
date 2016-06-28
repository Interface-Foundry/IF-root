from __future__ import print_function

from keras import backend as K
from keras.models import Model
from keras.layers import Input, Dense, Embedding, Dropout, LSTM, merge
from keras.optimizers import RMSprop
from keras.preprocessing.sequence import pad_sequences
from keras.callbacks import TensorBoard as TBC

from data import retrieve_from_prod_db, to_tk, actions_to_codes

import tensorflow as tf


def model():
    '''full bidirectional'''
    sess = tf.Session()
    K.set_session(sess)
    with tf.name_scope('inputs'):
        sequence = Input(shape=(data.shape[1],), dtype='int32')
        embed = Embedding(tk.nb_words, 128, input_length=data.shape[1])(sequence)

    # apply forwards + backwards LSTM
    with tf.name_scope('forwards'):
        forwards = LSTM(64, return_sequences=True)(embed)
        forwards = LSTM(64)(forwards)

    with tf.name_scope('backwards'):
        backwards = LSTM(64, return_sequences=True, go_backwards=True)(embed)
        backwards = LSTM(64)(backwards)

    with tf.name_scope('merging'):
        # concat the outputs of the 2 LSTMs
        merged = merge([forwards, backwards], mode='concat', concat_axis=-1)
        after_dp = Dropout(0.5)(merged)
        output = Dense(action_codes.shape[1], activation='softmax')(after_dp)

    with tf.name_scope('complete_model'):
        model = Model(input=sequence, output=output)

    with tf.name_scope('optimizer'):
        rmsprop = RMSprop(lr=0.0001, rho=0.9, epsilon=1e-08)

    with tf.name_scope('model_compiled'):
        model.compile(optimizer='adamax',
                      loss='categorical_crossentropy',
                      metrics=['accuracy'])

    return model


if __name__ == '__main__':
    pad_length = 20
    df = retrieve_from_prod_db()
    action_codes, ac_dict, rev_ac_dict = actions_to_codes(df)

    tk = to_tk(df)
    data = tk.texts_to_sequences(df.msg.values)
    data = pad_sequences(data, maxlen=pad_length)

    model = model()
    print(model.summary())
    tb_callback = TBC(log_dir='logs/', histogram_freq=2, write_graph=True)

    model.fit(data, action_codes,
              validation_split=.2,
              nb_epoch=100,
              batch_size=32,
              verbose=1,
              callbacks=[tb_callback])
