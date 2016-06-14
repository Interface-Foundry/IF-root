import numpy as np


class SequenceDataGen:
    '''Generate batches on sequential data (aka text) and differentiate between
    between messages

    Arguments:
        step_size: set input mean to 0 over the dataset.
        x_window: size of moving window over x
        y_window: size of moving window over y
        x_step: step between each x dataset
        y_step: step between each y dataset, should be identical to x_step
        x_y_diff: difference between x,y windows.
                    if 0, implies y window starts where x window stopped
                    if >=1, y window starts that many steps following x window
                    if <= -1, then the x_window, y_window will overlap
        batch_size: number of x,y training sequences to return
        shuffle: whether sequences should be shuffled or take t_1, ..., t_n
        vocab: if it is a text sequence example, creates hashing and stuff
    '''

    def __init__(self,
                 x_window=10,
                 y_window=1,
                 x_step=1,
                 x_y_diff=0,
                 batch_size=32,
                 shuffle=False,
                 vocab=False
                 ):

        self.x_window = x_window
        self.y_window = y_window

        self.x_step = x_step
        self.y_step = x_step

        self.x_y_diff = x_y_diff

        self.batch_index = 0
        self.total_batches_seen = 0

        self.batch_size = batch_size
        self.shuffle = shuffle
        self.vocab = vocab

    def reset(self):
        self.batch_index = 0

    def move_window(self):
        pass

    def gen_possible_indices(self, X):
        '''
        get possible indices's for time series given
        '''
        if isinstance(X, str):
            X_shape = len(X)
        else:
            X_shape = X.shape[0]
        last_window = self.x_window + self.y_window + self.x_y_diff
        idxes = list(range(0, X_shape - last_window, self.x_step))
        if self.shuffle:
            from random import shuffle
            shuffle(idxes)
        return idxes

    def generate_x_y(self, data, start_index):
        X_window_end = start_index + self.x_window
        X_window = data[start_index: X_window_end]
        y_start = X_window_end + self.x_y_diff
        y_end = y_start + self.y_window
        Y_window = data[y_start:y_end]
        return X_window, Y_window

    def _flow_single(self, data, seed=None):
        for idx in self.idxes:
            yield self.generate_x_y(data, idx)

    def flow_batch(self, data, seed=None):
        idxes_ = self.idxes_
        while idxes_:
            batch_ = idxes_[:self.batch_size]
            del idxes_[:self.batch_size]
            gend = [self.generate_x_y(data, b) for b in batch_]
            yield gend

    def flow(self, data, seed=None):
        self.idxes = self.gen_possible_indices(data)
        if self.vocab:
            self.flow_generator = self.flow_from_vocab(data)
        else:
            self.flow_generator = self.flow_batch(data)
        return self

    def flow_from_vocab(self, data, words=False):
        '''generator that does vocab to batches with vectorization
        '''
        if words:
            # TODO: split by words or chars, will need to create 'bank' for
            # word splits like :things_to_replace = {'\n': ' ', '--': ' -- '}
            # for k, v in things_to_replace.items():
            #     data = data.replace(k, v)
            # self.tokens = set(self.data.split(' '))
            pass
        else:
            self.tokens = set(data)

        self.idxes = self.gen_possible_indices(data)

        self.token_indices = dict((c, i) for i, c in enumerate(self.tokens))
        self.indices_token = dict((i, c) for i, c in enumerate(self.tokens))

        idxes_ = self.idxes
        while idxes_:
            # take current batch of indexes and then delete from available,
            # uses len(batch_) instead of self.batch_size b/c possible size of
            # last batch < batch_size
            batch_ = idxes_[:self.batch_size]
            del idxes_[:len(batch_)]
            # new np.eros array for each group of batches to pass into
            X = np.zeros((len(batch_), self.x_window,
                          len(self.tokens)), dtype=np.bool)
            Y = np.zeros((len(batch_), self.y_window,
                          len(self.tokens)), dtype=np.bool)
            # for each index in batch, take X,y vocab pair from data based on
            # window, put into vectorized X,y form
            for zero_index, i in enumerate(batch_):
                # provide single instance of sentence vectorized into X,y
                X_window_end = i + self.x_window
                X_window = data[i: X_window_end]
                y_start = X_window_end + self.x_y_diff
                y_end = y_start + self.y_window
                Y_window = data[y_start:y_end]
                for t, char in enumerate(X_window):
                    X[zero_index, t, self.token_indices[char]] = 1
                for t, char in enumerate(Y_window):
                    Y[zero_index, t, self.token_indices[char]] = 1
            yield X, Y

    def __iter__(self):
        # needed if we want to do something like:
        # for x, y in data_gen.flow(...):
        return self

    def __next__(self):
        # for python 3.x.
        return self.next()