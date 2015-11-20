from easydict import EasyDict as edict

# expects a dict with text, blob, and doc
def parse(data):
    print 'sup bitches'
    res = edict({})
    res.original = data.text

    sentences = data.blob.sentences

    ss = []
    for sent in sentences:
        s = edict({})
        s.sentiment_polarity = sent.sentiment.polarity
        s.sentiment_subjectivity = sent.sentiment.subjectivity
        ss.append(s)

    res.ss = ss
    
    pos = []
    for token in data.doc[:]:
        pos.append([token.orth_, token.pos_])
    res.parts_of_speech = pos
    res.noun_phrases = str(data.blob.noun_phrases)
    return res
