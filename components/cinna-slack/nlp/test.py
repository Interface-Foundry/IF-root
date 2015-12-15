# from textblob import TextBlob
#
# text = 'purfect kitten'
#
# blob = TextBlob(text)
# print blob.correct()

import calendar
import time
print 'starting'
print calendar.timegm(time.gmtime())

import os
from spacy.en import English, LOCAL_DATA_DIR
data_dir = os.environ.get('SPACY_DATA', LOCAL_DATA_DIR)
nlp = English(data_dir=data_dir)
print 'loaded data'
print calendar.timegm(time.gmtime())

doc = nlp(u'Hello, world. Here are two sentences.', tag=True, parse=True)
print 'nlp done'
print calendar.timegm(time.gmtime())
print doc

from spacy.parts_of_speech import ADV

def is_adverb(token):
    return token.pos == spacy.parts_of_speech.ADV

# These are data-specific, so no constants are provided. You have to look
# up the IDs from the StringStore.
NNS = nlp.vocab.strings['NNS']
NNPS = nlp.vocab.strings['NNPS']
def is_plural_noun(token):
    return token.tag == NNS or token.tag == NNPS

def print_coarse_pos(token):
    print(token.pos_)

def print_fine_pos(token):
    print(token.tag_)

def dependency_labels_to_root(token):
    '''Walk up the syntactic tree, collecting the arc labels.'''
    dep_labels = []
    while token.head is not token:
        dep_labels.append(token)
        token = token.head
    return dep_labels

print 'starting enumerate'
print calendar.timegm(time.gmtime())
for token in doc[:]:
    print token.pos_
    print dependency_labels_to_root(token)
print 'ending enumerate'
print calendar.timegm(time.gmtime())


for ent in doc.ents:
    print ent, ent.label_
