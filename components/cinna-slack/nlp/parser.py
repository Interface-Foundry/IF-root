from easydict import EasyDict as edict

# expects a dict with text, blob, and doc
def parse(data):
    print 'entering parser method'
    res = edict({})
    res.original = data.text

    sentences = data.blob.sentences

    ss = []
    for sent in sentences:
        s = edict({})
        s.sentiment_polarity = sent.sentiment.polarity
        s.sentiment_subjectivity = sent.sentiment.subjectivity
        s.noun_phrases = sent.noun_phrases
        ss.append(s)

    for i, sent in enumerate(data.doc.sents):
        s = ss[i]
        s.parts_of_speech = []
        for token in sent:
            s.parts_of_speech.append([token.orth_, token.pos_])
        if s.parts_of_speech[-1][0] == '?':
            s.isQuestion = True
        else:
            s.isQuestion = False

    res.ss = ss

    pos = []
    for token in data.doc[:]:
        pos.append([token.orth_, token.pos_])
    res.parts_of_speech = pos
    res.noun_phrases = data.blob.noun_phrases
    return res
