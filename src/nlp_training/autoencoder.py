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


def autoencoder():
    inputs = Input(shape=(data.shape[1],), dtype='int32')

    # Encoding and Decoding
    encoded = Embedding(input_dim=input_dim, output_dim=128,
                        mask_zero=True)(inputs)
    encoded = LSTM(128, return_sequences=False)(encoded)

    decoded = RepeatVector(max_len)(encoded)
    decoded = LSTM(128, return_sequences=False)(decoded)
    decoded = Dense(max_len, activation='softmax')(decoded)

    # Models
    sequence_autoencoder = Model(inputs, decoded)
    encoder = Model(inputs, encoded)

    # Compile
    sequence_autoencoder.compile(
        optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])
    sequence_autoencoder.fit(
        X_train, X_train,
        validation_data=(X_test, X_test),
        nb_epoch=5,
        batch_size=128,
        shuffle=True,
        verbose=1
    )


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
