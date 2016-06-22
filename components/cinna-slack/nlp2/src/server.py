from __future__ import print_function
from easydict import EasyDict
from flask import Flask, request, jsonify
import logging
import parser

from mcparser import McParser

orig_ = True
port_num = 8083
app = Flask(__name__)


# ---- Logging prefs -----
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


if orig_:
    logging.info('using spacy')
    from spacy.en import English
    from textblob import TextBlob
    nlp_data_dir = '/usr/local/lib/python2.7/dist-packages/spacy/data/en-1.1.0'
    nlp = English(data_dir=nlp_data_dir)


@app.route('/parse', methods=['GET', 'POST'])
def parse_message(orig_parser=orig_):
    '''
    '''
    data = EasyDict({})
    data.text = request.json['text']

    # ------------------------------------------------------------------------
    # original parser
    if orig_parser:
        logging.debug('using old parser')
        data.blob = TextBlob(data.text)
        data.doc = nlp(u"{}".format(data.text),
                       tag=True, parse=True, entity=True)
        try:
            resp = jsonify(parser.parse(data))
        except:
            logging.critical('didnt work with orig parser')

    # ------------------------------------------------------------------------
    # syntaxnet parser
    else:
        logging.debug('using mcparser')
        data.doc = McParser(data.text).output_form()
        try:
            resp = jsonify(data)
        except:
            logging.critical('didnt work with syntaxnet parser')
    logging.debug('returning results...')
    return resp


@app.route('/reload')
def reload_parse():
    logging.debug('trying to reload........')
    reload(parser)
    return 'ok'

if __name__ == '__main__':
    logging.info('running app on port ' + str(port_num))
    app.run(host="0.0.0.0",
            port=port_num,
            use_debugger=True,
            debug=True,
            use_reloader=False)
