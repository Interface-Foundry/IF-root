from keras.models import model_from_json
from keras.preprocessing.sequence import pad_sequences
import pickle
import json
from os import path
# K.set_learning_phase(0)


def load_model(filename='latest_model', folder='models'):
    '''
    '''
    model = model_from_json(open(path.join(folder, filename + '.json')).read())
    model.load_weights(path.join(folder, filename + '.hdf5'))
    return model


def load_tokenizer(pkl_name='tokenizer.pkl', foldername='pkls'):
    with open(path.join(foldername, pkl_name), 'rb') as f:
        tokenizer = pickle.load(f)
    return tokenizer


class Predict:
    '''
    '''

    def __init__(self):
        '''
        base predictor class
        '''
        with open('config/config.json') as cfg:
            self.config = json.load(cfg)

        self.model = load_model(filename='latest_model', folder='models')
        self.model.compile(optimizer='rmsprop',
                           loss='categorical_crossentropy')
        self.model_layout = self.model.to_json()

        self.tokenizer = load_tokenizer()
        self.action_dict = self.config['ac_dict']
        self.reverse_action_dict = self.config['rev_ac_dict']

    def return_predictions(self, text):
        ''' take input text and return
        '''
        self.tokenizer()
        pad_length = self.config['pad_length']
        if type(text) is str:
            text = [text]
        sequenced = self.tokenizer.texts_to_sequences(text)
        preds = self.model.predict(pad_sequences(sequenced, maxlen=pad_length))
        return self.reverse_action_dict[str(preds.argmax())]
