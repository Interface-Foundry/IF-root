"""
initial parsing stuff mimicking original
"""
from __future__ import print_function
from easydict import EasyDict as edict
from textblob import TextBlob
from flask import Flask, request, jsonify


app = Flask(__name__)



@app.route('/parse', methods=['GET', 'POST'])
def parse_message():
    # print('at parse_message')
    # print(request.json)
    # data = edict({})
    # data.text = request.json['text']
    # data.blob = TextBlob(data.text)
    # data.doc = nlp(u"{}".format(data.text),tag=True,parse=True, entity=True)
    # d = jsonify(parser.parse(data))
    pass


@app.route('/reload')
def reload_parse():
    pass

# @app.route('/parsey', methods=['GET', 'POST'])
# def parsey():

if __name__ == '__main__':
    print('running app on port 8083')
    app.run(host="0.0.0.0", port=8083, use_debugger=True,
            debug=True, use_reloader=False)
