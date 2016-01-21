from gensim.models import Doc2Vec

import numpy
from random import shuffle

class Sentences(object):
    def __init__(self, file):
        self.file = file;

    def __iter__(self):
        with utils.smart_open(self.file) as fin:
            for item_no, line in enumerate(fin):
                line = line.lower()
                line = re.sub('[?!"\']', '', line)
                yield LabeledSentence(utils.to_unicode(line).split(), ['SENT_%s' % item_no])

    def to_array(self):
        self.sentences = []
        with utils.smart_open(self.file) as fin:
            for item_no, line in enumerate(fin):
                line = line.lower()
                line = re.sub('[?!"\']', '', line)
                self.sentences.append(LabeledSentence(utils.to_unicode(line).split(), ['SENT_%s' % item_no]))
        return self.sentences

    def shuffle(self):
        shuffle(self.sentences)
        return self.sentences

# Grab the sentences!
sentences = Sentences('./sentences.txt')


# Define model
model = Doc2Vec(min_count=1, window=10, size=100, sample=1e-4, negative=5, workers=8)
model.build_vocab(sentences.to_array())

# Train
for epoch in range(10):
    model.train(sentences.shuffle())


model.save('./question_answering_model.doc2vec')
