from __future__ import print_function

import json

import tensorflow as tf
from keras import backend as K
from keras.models import Model
from keras.layers import Input, Dense, Embedding, Dropout, LSTM, merge
from keras.optimizers import RMSprop
from keras.preprocessing.sequence import pad_sequences
from keras.callbacks import TensorBoard, ModelCheckpoint


from data import retrieve_from_prod_db, to_tk, actions_to_codes
from utils import save_model, save_tokenizer


with open('config/config.json', 'r') as f:
    config = json.load(f)


def auto_encoder():
    with tf.name_scope('session'):
        # trying to make tensorboard useable
        sess = tf.Session()
        K.set_session(sess)

    with tf.name_scope('inputs'):
        inputs = Input(shape=(data.shape[1],), dtype='int32')
        # embed = Embedding(input_dim=tk.nb_words,
        #                   output_dim=128,
        #                   input_length=data.shape[1],
        #                   mask_zero=True)(inputs)

    with tf.name_scope('encoder_decoder'):
        encoded = LSTM(32)(inputs)

        decoded = RepeatVector(data.shape[1])(encoded)
        decoded = LSTM(data.shape[1], return_sequences=True)(decoded)

    with tf.name_scope('model_compiled'):
        sequence_autoencoder = Model(inputs, decoded)
        encoder = Model(inputs, encoded)
        rmsprop = RMSprop(lr=0.0001, rho=0.9, epsilon=1e-08)
        encoder.compile(optimizer=rmsprop,
                        loss='categorical_crossentropy',
                        metrics=['accuracy'])


if __name__ == '__main__':

    pad_length = config['pad_length']
    ac_dict = config['ac_dict']
    rev_ac_dict = config['rev_ac_dict']

    df = retrieve_from_prod_db()
    action_codes, ac_dict, rev_ac_dict = actions_to_codes(df)

    tk = to_tk(df)
    data = tk.texts_to_sequences(df.msg.values)
    data = pad_sequences(data, maxlen=pad_length)

    auto_encoder = auto_encoder()
    print(auto_encoder.summary())

    auto_encoder.fit(data, action_codes,
                     validation_split=.2,
                     nb_epoch=250,
                     batch_size=16,
                     verbose=1,
                     callbacks=[tb, mc])
