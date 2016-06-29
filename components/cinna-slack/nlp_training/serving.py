from keras.models import model_from_config
from utils import load_model, load_tokenizer

# K.set_learning_phase(0)


class Predictor:
    '''
    '''

    def __init__(self):
        self.model = load_model(filename='latest_model', folder='models')
        self.tokenizer = load_tokenizer()
        # model.compile(optimizer='rmsprop', loss='categorical_crossentropy')

    def return_predictions(self, text):
        '''
        '''
        self.tokenizer()

    '''
    '''
    if type(text) is str:
        text = [text]

    preds = model.predict(pad_sequences(
        tokenizer.texts_to_sequences(text), maxlen=pad_length))

    reverse_action_dict[preds.argmax()]


model = load_model(filename='latest_model', folder='models')
# # serialize the model and get its weights, for quick re-building

config = model.get_config()
weights = model.get_weights()

# # re-build a model where the learning phase is now hard-coded to 0
model = model_from_config(config)
model.set_weights(weights)



tokenizer = load_tokenizer()
