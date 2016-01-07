from easydict import EasyDict as edict

# data.text is the original text
# data.blob is the output of TextBlob
# data.doc is the output of spaCy
def parse(data):
    print 'entering parser method'
    print data.text

    # Create the object we will return from the api
    res = edict({})
    res.text = data.text

    sentences = data.blob.sentences

    # ALL Entities in every sentence
    res.entities = []
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
        if (sent.find('first') >= 0) or (sent.find('1') >= 0) or (sent.words.count('one') > 0):
            s.focus.append(1)
        if (sent.find('second') >= 0) or (sent.find('2') >= 0) or (sent.words.count('two') > 0):
            s.focus.append(2)
        if (sent.find('third') >= 0) or (sent.find('3') >= 0) or (sent.words.count('three') > 0):
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
            res.isQuestion = True
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


    # ALL nouns
    res.nouns = set()
    for n in data.blob.noun_phrases:
        res.nouns.add(n.lower())
    for chunk in data.doc.noun_chunks:
        res.nouns.add(chunk.orth_.lower())
    if (len(res.nouns) == 0):
        for token in res.parts_of_speech:
            if token[1] == 'NOUN':
                res.nouns.add(token[0])
    res.nouns = list(res.nouns)

    # Adjectives & verrrrrbs
    res.adjectives = []
    res.verbs = []
    for token in res.parts_of_speech:
        if (token[1] == 'ADJ'):
            res.adjectives.append(token[0])
        if (token[1] == 'VERB'):
            res.verbs.append(token[0])
        if (token[0] == 'checkout'):  # thinks checkout is a noun...
            res.verbs.append('checkout')
        if (token[0] == 'info'):
            res.verbs.append('info')


    return res
