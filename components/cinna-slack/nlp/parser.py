import easydict as edict

# expects a dict with text, blob, and doc
def parse(data):
    res = edict({})
    res.original = data.text

    sentences = data.blob.sentences

    for sent in sentences:
        print sent.sentiment.polarity
    
    pos = []
    for token in data.doc[:]:
        pos.append([token.orth_, token.pos_])
    print pos
    res.parts_of_speech = pos
    res.noun_phrases = str(b.noun_phrases)
    return res
