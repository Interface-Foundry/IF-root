from __future__ import print_function
from flask import Flask, request, jsonify
import logging
import time

from .mcparser import McParser

port_num = 8083
application = Flask(__name__)

# ---- Logging prefs -----
logFormat = "[%(asctime)s]   [%(process)d] [%(levelname)-1s] %(message)s"
logging.basicConfig(level=logging.INFO,
                    format=logFormat)


@application.route('/parse', methods=['GET', 'POST'])
def parse_message():
    '''
    not incorporating legacy parser or parser.sh anymore
    '''
    t1 = time.time()
    text = request.json['text']
    # data.history = request.json['history']
    logging.info('query: ' + text)
    resp = McParser(text)
    logging.debug(resp.dependency_array)
    resp = resp.output_form()
    logging.info(resp)
    logging.debug('------returning results------')
    logging.info('total syntaxnet time taken ' + str(time.time() - t1))
    return jsonify(resp)


if __name__ == '__main__':
    logging.info('running app on port ' + str(port_num))
    application.run(host="0.0.0.0",
                    port=port_num,
                    use_debugger=True,
                    debug=True,
                    use_reloader=False)
