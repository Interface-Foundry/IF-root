from easydict import EasyDict as edict
from gensim.models import Doc2Vec
import json
# from gensim import Doc2Vec
from flask import (
    Flask,
    request,
    jsonify,
    Response
)

# https://linanqiu.github.io/2015/10/07/word2vec-sentiment/

print 'loading data, usually takes 75 seconds on my mac'
# TODO make own model
# model = Doc2Vec.load_word2vec_format('GoogleNews-vectors-negative300.bin', binary=True)
model_loaded = Doc2Vec.load('./question_answering_model.doc2vec')

app = Flask(__name__)

@app.route('/embedone', methods=['GET', 'POST'])
def parse_message():
    print 'at embedone'
    text = request.json['text'].lower()
    text = re.sub('[?!"\']', '', text)
    print text
    sentence = utils.to_unicode(text).split()
    return Response(json.dumps(model.infer_vector(sentence)),  mimetype='application/json')

@app.route('/reload')
def reload_parse():
    reload(parser)
    return 'ok'

if __name__ == '__main__':
    print 'running app on port 8084'
    app.run(host="0.0.0.0", port=8084, use_debugger=True, debug=True, use_reloader=False)
