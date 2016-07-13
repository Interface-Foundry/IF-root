from __future__ import print_function

import json

import tensorflow as tf
from keras.models import Model
from keras.layers import Input, Dense, Embedding, Dropout, LSTM, GRU, merge, Convolution1D, MaxPooling1D
from keras.optimizers import RMSprop, Adam
from keras.preprocessing.sequence import pad_sequences
from keras.callbacks import TensorBoard, ModelCheckpoint, EarlyStopping
from heraspy.model import HeraModel

from data import retrieve_from_prod_db, to_tk, actions_to_codes, \
    classes_to_weights
from utils import save_model, save_tokenizer, load_glove_vocab, \
    load_glove_vectors

with open('config/config.json', 'r') as f:
    config = json.load(f)


def model():
    '''full bidirectional LSTM'''
    with tf.name_scope('inputs'):
        sequence = Input(shape=(data.shape[1],), dtype='int32')
        embed = Embedding(input_dim=tk.nb_words,
                          output_dim=256,
                          input_length=data.shape[1],
                          mask_zero=False)(sequence)

    # with tf.name_scope('simple_conv'):
    #     conv = Dropout(0.25)(embed)
    #     conv = Convolution1D(nb_filter=64,
    #                          filter_length=3,
    #                          border_mode='valid',
    #                          activation='relu',
    #                          subsample_length=1)(conv)
    #     conv = MaxPooling1D(pool_length=2)(conv)

    with tf.name_scope('forwards'):
        fw = GRU(128, consume_less='gpu', return_sequences=True)(embed)
        fw = GRU(128, consume_less='gpu')(fw)

    with tf.name_scope('backwards'):
        bw = GRU(128, consume_less='gpu', return_sequences=True,
                 go_backwards=True)(embed)
        bw = GRU(128, consume_less='gpu')(bw)

    with tf.name_scope('merge1'):
        # concat the outputs of the 2 LSTMs
        merged = merge([fw, bw], mode='concat', concat_axis=-1)
        after_dp = Dropout(0.5)(merged)

    with tf.name_scope('complete_model'):
        # to dense output
        output = Dense(action_codes.shape[1], activation='softmax')(after_dp)
        model = Model(input=sequence, output=output)

    with tf.name_scope('optimizer'):
        optimizer_ = RMSprop(lr=0.00001, rho=0.9, epsilon=1e-08)

    with tf.name_scope('model_compiled'):
        model.compile(optimizer=optimizer_,
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

    es = EarlyStopping(
        monitor='val_loss',
        patience=10)

    hm = HeraModel({'id': 'action-rnn'},
                   {'domain': 'localhost', 'port': 80})

    return tb, mc, es, hm

if __name__ == '__main__':

    pad_length = config['pad_length']
    # ac_dict = config['ac_dict']
    # rev_ac_dict = config['rev_ac_dict']

    df = retrieve_from_prod_db()

    # glove vectors if using embedding pretraining
    # glove_vocab_array, glove_vocab_dict = load_glove_vocab(
    #     config['glove_filename'])
    # glove_vectors, glove_dict = load_glove_vectors(
    #     config['glove_filename'], set(glove_vocab_array))

    action_codes, ac_dict, rev_ac_dict = actions_to_codes(df)
    weight_dict = classes_to_weights(df, ac_dict)
    print('dataframe shape : ', df.shape)
    config['ac_dict'] = ac_dict
    config['rev_ac_dict'] = rev_ac_dict

    tk = to_tk(df)
    data = tk.texts_to_sequences(df.msg.values)
    data = pad_sequences(data, maxlen=pad_length)

    model = model()
    save_model(model)
    print(model.summary())

    tb, mc, es, hm = get_callbacks()

    save_tokenizer(tk)
    model.fit(data, action_codes,
              validation_split=.2,
              nb_epoch=1000,
              batch_size=16,
              verbose=1,
              callbacks=[tb, mc, es, hm.callback],
              class_weight=weight_dict)
