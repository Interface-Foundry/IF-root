from keras import backend as K
from keras.models import model_from_config

from utils import load_model

# K.set_learning_phase(0)

model = load_model(filename='latest_model', folder='models')
# # serialize the model and get its weights, for quick re-building

config = model.get_config()
weights = model.get_weights()

# # re-build a model where the learning phase is now hard-coded to 0
model = model_from_config(config)
model.set_weights(weights)
