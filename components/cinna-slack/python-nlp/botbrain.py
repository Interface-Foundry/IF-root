from easydict import EasyDict as edict

from textblob import TextBlob
from flask import (
    Flask,
    request,
    jsonify
)

app = Flask(__name__)

@app.route('/parse', methods=['GET', 'POST'])
def parse():
    b = TextBlob(request.json['text'])

    res = edict({})
    res.original = str(request.json['text'])
    res.corrected = str(b.correct())
    res.noun_phrases = str(b.noun_phrases)

    return jsonify(res)

if __name__ == '__main__':
    print 'running app on port 5000'
    app.debug = True
    app.run()
