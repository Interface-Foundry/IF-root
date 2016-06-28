from __future__ import print_function

from keras.models import Model
from keras.layers import Input, Dense, Embedding, Dropout, LSTM, merge
from keras.optimizers import RMSprop

from keras.preprocessing.sequence import pad_sequences
from keras.callbacks import TensorBoard

from data import retrieve_from_prod_db, to_tk, actions_to_codes


def model():
    sequence = Input(shape=(data.shape[1],), dtype='int32')
    embedded = Embedding(
        tk.nb_words, 128, input_length=data.shape[1])(sequence)

    # apply forwards + backwards LSTM
    # commented out is deeper, testing shallow network
    # forwards = LSTM(64, return_sequences=True)(embedded)
    # forwards = LSTM(64)(forwards)
    # backwards = LSTM(64, return_sequences=True, go_backwards=True)(embedded)
    # backwards = LSTM(64)(backwards)

    forwards = LSTM(64)(embedded)
    backwards = LSTM(64, go_backwards=True)(embedded)

    # concat the outputs of the 2 LSTMs
    merged = merge([forwards, backwards], mode='concat', concat_axis=-1)
    after_dp = Dropout(0.5)(merged)
    output = Dense(action_codes.shape[1], activation='softmax')(after_dp)

    model = Model(input=sequence, output=output)
    rmsprop = RMSprop(lr=0.0001, rho=0.9, epsilon=1e-08)
    model.compile(optimizer=rmsprop,
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])
    return model


def predict_to_class(text, tokenizer, model, reverse_action_dict):
    '''
    '''
    if type(text) is str:
        text = [text]

    preds = model.predict(pad_sequences(
        tokenizer.texts_to_sequences(text), maxlen=pad_length))


if __name__ == '__main__':
    pad_length = 20
    df = retrieve_from_prod_db()
    action_codes, ac_dict, rev_ac_dict = actions_to_codes(df)

    tk = to_tk(df)
    data = tk.texts_to_sequences(df.msg.values)
    data = pad_sequences(data, maxlen=pad_length)

    model = model()
    print(model.summary())
    tb_callback = TensorBoard(
        log_dir='logs/', histogram_freq=0, write_graph=True)

    model.fit(data, action_codes,
              validation_split=.2,
              nb_epoch=10,
              batch_size=32,
              verbose=1,
              callbacks=[tb_callback])
