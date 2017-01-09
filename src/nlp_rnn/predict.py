# K.set_learning_phase(0)
from keras.models import model_from_json
from keras.preprocessing.sequence import pad_sequences
import pickle
import json
import numpy as np
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


def output_form(obj):
    '''
    turn dict which may have numpy stuff from keras into jsonifyable obj
    '''
    for k, v in obj.items():
        if isinstance(v, np.integer):
            obj[k] = int(v)
        elif isinstance(v, np.floating):
            obj[k] = float(v)
        elif isinstance(v, np.ndarray):
            obj[k] = v.tolist()
        else:
            obj[k] = v
    return obj


class PredictionsOnText:
    '''
    prediction class
    '''

    def __init__(self, text, tokenizer):
        self.text = text

    def output_form(self):
        return self.__dict__

    def tokenize_text(self):
        self.sequenced = tokenizer.texts_to_sequences(text)
        if type(text) is str:
            text = [text]
        logging.info('text received: ' + str(text))
        response_object = PredictionsOnText(text)
        sequenced = response_object.tokenize_text(self.tokenizer)
        logging.info('converted to sequence sequence: ' + str(sequenced))
        self.preds = self.model.predict(pad_sequences(
            sequenced, maxlen=self.pad_length))
        logging.info('preds: \n' + str(self.preds[0]))
        self.resp = self.preds[0].argsort()[::-1]
        self._preds_to_preds_tuple()
        return self.r_action_dict[str(self.resp[0])]


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

    def _preds_to_preds_tuple(self, r_object):
        preds_classes = []
        for idx, resp_idx in enumerate(r_object['resp_idxs']):
            cur_class = self.r_action_dict[str(resp_idx)]
            preds_classes.append((cur_class, r_object['preds'][resp_idx].item()))
            logging.info('pred {}: {}'.format(
                idx, self.r_action_dict[str(resp_idx)]))
        return preds_classes

    def return_predictions(self, text):
        ''' take input text and return
        '''
        response_object = {}
        response_object['text'] = text
        if type(text) is str:
            text = [text]

        logging.info('text received: ' + str(response_object['text']))
        response_object['sequenced'] = self.tokenizer.texts_to_sequences(response_object['text'])

        logging.debug('conv 2 sequence: ' + str(response_object['sequenced']))

        padded = pad_sequences(response_object['sequenced'], self.pad_length)
        response_object['preds'] = self.model.predict(padded)[0]
        logging.info('preds: \n' + str(response_object['preds']))
        response_object['resp_idxs'] = response_object['preds'].argsort()[::-1]
        logging.debug(response_object)
        response_object['preds_classes'] = self._preds_to_preds_tuple(
            response_object)
        del response_object['preds']
        return output_form(response_object)

