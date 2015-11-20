from easydict import EasyDict as edict

# expects a dict with text, blob, and doc
def parse(data):
    print 'entering parser method'
    print data.text
    res = edict({})
    res.text = data.text
    res.original = data.text

    sentences = data.blob.sentences

    # Entities
    res.entities = [] #list(data.doc.ents)
    for entity in list(data.doc.ents):
        res.entities.append([entity.orth_, entity.label_])

    # Get sentence-level stuff from both TextBlob and spaCy
    # (this assumes that both libs recognize sentences the same way)
    ss = []
    for sent in sentences:
        s = edict({})

        # Sentiment
        s.sentiment_polarity = sent.sentiment.polarity
        s.sentiment_subjectivity = sent.sentiment.subjectivity

        # Noun phrases
        s.noun_phrases = sent.noun_phrases
        ss.append(s)

        # item focus
        s.focus = []
        if (sent.find('first') > 0) or (sent.find('1') > 0) or (sent.find('one') > 0):
            s.focus.append(1)
        if (sent.find('second') > 0) or (sent.find('2') > 0) or (sent.find('two')> 0):
            s.focus.append(2)
        if (sent.find('third') > 0) or (sent.find('3') > 0) or (sent.find('three')> 0):
            s.focus.append(3)

    for i, sent in enumerate(data.doc.sents):
        s = ss[i]

        # parts of speech (spaCy is fast)
        s.parts_of_speech = []
        for token in sent:
            s.parts_of_speech.append([token.orth_, token.pos_])

        # isQuestion
        if s.parts_of_speech[-1][0] == '?':
            s.isQuestion = True
        else:
            s.isQuestion = False

    res.ss = ss

    # All focus
    res.focus = set([])
    for s in res.ss:
        for f in s.focus:
            res.focus.add(f)

    res.focus = list(res.focus)

    pos = []
    for token in data.doc[:]:
        pos.append([token.orth_, token.pos_])
    res.parts_of_speech = pos
    res.noun_phrases = data.blob.noun_phrases
    res.noun_chunks = [chunk.orth_ for chunk in data.doc.noun_chunks]
    return res
