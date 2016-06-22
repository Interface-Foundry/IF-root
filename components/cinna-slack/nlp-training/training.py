from keras.models import Model
from keras.layers import Input, Dense, Embedding

from data import data_for_model

maxlen = 20
max_features = 20000


def model(index_size,vector_size,):
    seq = Input(shape=(maxlen,), dtype='int32')
    embedded = Embedding(max_features, 128, input_length=maxlen)(sequence)



if __name__ == '__main__':
    data, targets = data_for_model()