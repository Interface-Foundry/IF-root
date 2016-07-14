# K.set_learning_phase(0)
from keras.models import model_from_json
from keras.preprocessing.sequence import pad_sequences
import pickle
import json
from os import path
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


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


class ModelPredictor:
    '''
    '''

    def __init__(self):
        '''
        base predictor class
        '''
        with open('config.json') as cfg:
            self.config = json.load(cfg)

        self.model = load_model(filename='latest_model', folder='models')
        self.model.compile(optimizer='rmsprop',
                           loss='categorical_crossentropy')
        self.model_layout = self.model.to_json()

        self.tokenizer = load_tokenizer()
        self.pad_length = self.config['pad_length']
        self.action_dict = self.config['ac_dict']
        self.r_action_dict = self.config['rev_ac_dict']

    def preds_to_classes_logger(self, resp):
        logging.info('ordered preds: \n')
        p_number = 0
        for resp_index in resp[0]:
            logging.info('pred {}: {}'.format(
                p_number, self.r_action_dict[str(resp_index)]))
            p_number += 1

    def return_predictions(self, text):
        ''' take input text and return
        '''
        if type(text) is str:
            text = [text]
        logging.info('text received: ' + str(text))
        sequenced = self.tokenizer.texts_to_sequences(text)
        logging.info('converted to sequence sequence: ' + str(sequenced))
        preds = self.model.predict(pad_sequences(
            sequenced, maxlen=self.pad_length))
        logging.info('preds: \n' + str(preds))
        resp = preds.argsort()[::-1]
        self.preds_to_classes_logger(resp)
        return self.r_action_dict[str(resp[0][0])]
