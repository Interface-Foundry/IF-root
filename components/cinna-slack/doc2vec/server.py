from easydict import EasyDict as edict
import json
# from gensim import Doc2Vec
from flask import (
    Flask,
    request,
    jsonify,
    Response
)

print 'loading data, usually takes 75 seconds on my mac'
# model_loaded = Doc2Vec.load('./qa_model.doc2vec')

app = Flask(__name__)

@app.route('/embedone', methods=['GET', 'POST'])
def parse_message():
    print 'at embedone'
    print request.json
    data = edict({})
    data.text = request.json['text']
    return Response(json.dumps([0, 1, 2, 3, 4]),  mimetype='application/json')

@app.route('/reload')
def reload_parse():
    reload(parser)
    return 'ok'

if __name__ == '__main__':
    print 'running app on port 8084'
    app.run(host="0.0.0.0", port=8084, use_debugger=True, debug=True, use_reloader=False)
