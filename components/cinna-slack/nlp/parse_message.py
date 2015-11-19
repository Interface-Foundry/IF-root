from easydict import EasyDict as edict

from textblob import TextBlob
from textblob.taggers import NLTKTagger
from flask import (
    Flask,
    request,
    jsonify
)

app = Flask(__name__)

tagger = NLTKTagger()

@app.route('/parse', methods=['GET', 'POST'])
def parse():
    b = TextBlob(request.json['text'], pos_tagger=tagger)

    res = edict({})
    res.original = str(request.json['text'])
    # b = TextBlob(str(b.correct()), pos_tagger=tagger)
    # res.corrected = str(b)
    res.noun_phrases = str(b.noun_phrases)
    res.parts_of_speech = b.pos_tags

    return jsonify(res)

if __name__ == '__main__':
    print 'running app on port 5000'
    app.debug = True
    app.run()
