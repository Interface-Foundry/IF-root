from __future__ import print_function
from easydict import EasyDict as edict

import parser

from textblob import TextBlob
from flask import (
    Flask,
    request,
    jsonify
)
"""
similar but using SyntaxNext/Parsey McParseface instead of
"""

import os
from spacy.en import English, LOCAL_DATA_DIR
data_dir = os.environ.get('SPACY_DATA', LOCAL_DATA_DIR)
print('loading data, usually takes 75 seconds on my mac')
nlp = English(data_dir=data_dir)

app = Flask(__name__)

@app.route('/parse', methods=['GET', 'POST'])
def parse_message():
    print('at parse_message')
    print(request.json)
    data = edict({})
    data.text = request.json['text']
    data.blob = TextBlob(data.text)
    data.doc = nlp(u"{}".format(data.text), tag=True, parse=True, entity=True)
    d = jsonify(parser.parse(data))
    return d


@app.route('/reload')
def reload_parse():
    reload(parser)
    return 'ok'

# @app.route('/parsey', methods=['GET', 'POST'])
# def parsey():

if __name__ == '__main__':
    print('running app on port 8083')
    app.run(host="0.0.0.0", port=8083, use_debugger=True, debug=True, use_reloader=False)