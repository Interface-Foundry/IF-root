from __future__ import print_function
from flask import Flask, request, jsonify
import logging
import time

import legacy as parser
from mcparser import McParser

orig_ = False
port_num = 8083
application = Flask(__name__)


# ---- Logging prefs -----
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')


if orig_:
    logging.debug('------using spacy------')
    from easydict import EasyDict
    from spacy.en import English
    from textblob import TextBlob
    nlp = English()


@application.route('/parse', methods=['GET', 'POST'])
def parse_message(orig_parser=orig_):
    '''
    '''
    t1 = time.time()
    text = request.json['text']
    # data.history = request.json['history']
    logging.info('query: ' + text)
    # ------------------------------------------------------------------------
    # original parser
    if orig_parser:
        data = EasyDict({})
        data.text = text
        logging.debug('using old parser')
        data.blob = TextBlob(data.text)
        data.doc = nlp(u"{}".format(data.text),
                       tag=True, parse=True, entity=True)
        resp = parser.parse(data)
        logging.debug(resp)
    # ------------------------------------------------------------------------
    # syntaxnet parser
    else:
        logging.debug('using mcparser')
        resp = McParser(text)

        logging.debug(resp.dependency_array)
        resp = resp.output_form()
        logging.info(resp)

    logging.debug('------returning results------')
    logging.info('total syntaxnet time taken ' + str(time.time() - t1))
    return jsonify(resp)


@application.route('/reload')
def reload_parse():
    logging.debug('------trying to reload------')
    reload()


if __name__ == '__main__':
    logging.info('running app on port ' + str(port_num))
    application.run(host="0.0.0.0",
                    port=port_num,
                    use_debugger=True,
                    debug=True,
                    use_reloader=False)
