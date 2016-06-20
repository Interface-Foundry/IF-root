from __future__ import print_function
from easydict import EasyDict as edict
from flask import Flask, request, jsonify
from textblob import TextBlob
from spacy.en import English

import parser

port_num = 8083

print('loading data, ~10 seconds')
nlp = English(
    data_dir='/usr/local/lib/python2.7/dist-packages/spacy/data/en-1.1.0')

app = Flask(__name__)


@app.route('/parse', methods=['GET', 'POST'])
def parse_message():
    print('at parse_message')
    print(request.json)
    data = edict({})
    data.text = request.json['text']
    data.blob = TextBlob(data.text)
    data.doc = nlp(u"{}".format(data.text), tag=True, parse=True, entity=True)
    return jsonify(parser.parse(data))


@app.route('/reload')
def reload_parse():
    reload(parser)
    return 'ok'

# @app.route('/parsey', methods=['GET', 'POST'])
# def parsey():

if __name__ == '__main__':
    print('running app on port ', port_num)
    app.run(host="0.0.0.0",
            port=port_num,
            use_debugger=True,
            debug=True,
            use_reloader=False)
