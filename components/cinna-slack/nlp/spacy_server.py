from easydict import EasyDict as edict

from textblob import TextBlob
from flask import (
    Flask,
    request,
    jsonify
)

print 'loading data, usually takes 75 seconds on my mac'
import os
from spacy.en import English, LOCAL_DATA_DIR
data_dir = os.environ.get('SPACY_DATA', LOCAL_DATA_DIR)
nlp = English(data_dir=data_dir)

app = Flask(__name__)

@app.route('/parse', methods=['GET', 'POST'])
def parse():
    text = request.json['text']
    b = TextBlob(text)

    res = edict({})
    res.original = str(text)
    doc = nlp(u"{}".format(text), tag=True, parse=True)
    pos = []
    for token in doc[:]:
        pos.append([token.orth_, token.pos_])
    print pos
    res.parts_of_speech = pos
    res.noun_phrases = str(b.noun_phrases)

    return jsonify(res)

if __name__ == '__main__':
    print 'running app on port 5000'
    app.debug = True
    app.run()
