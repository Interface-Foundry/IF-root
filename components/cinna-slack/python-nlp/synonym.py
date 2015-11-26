from easydict import EasyDict as edict
from PyDictionary import PyDictionary
from nltk.corpus import wordnet
from itertools import product
dictionary=PyDictionary()
from flask import (
    Flask,
    request,
    jsonify
)

app = Flask(__name__)

@app.route('/syn',methods=['GET','POST'])
def findSyn():
  res = edict({})
  res.original = str(request.data)
  syn_set = wordnet.synsets(res.original)
  res.synonyms = []
  for i,j in enumerate(syn_set):
    # print "Synonyms:", ", ".join(j.lemma_names())
    res.synonyms.append(j.lemma_names())
  # print wordnet.synsets(res.original)
  # res.synonyms =  dictionary.synonym(res.original)
  return jsonify(res)

@app.route('/compare',methods=['GET','POST'])
def compare():
  res = edict({})
  request.data = request.get_json(force=True)
  ss1 = wordnet.synsets(str(request.data['first']))
  ss2 = wordnet.synsets(str(request.data['second']))
  res.results = []
  for s1 in ss1:
    for s2 in ss2:
        data = edict({})
        # print s1
        # print s2
        # print max(s1.path_similarity(s2))
        data.target = str(s2)
        if s1.path_similarity(s2) is not None:
          data.score = s1.path_similarity(s2)
          res.results.append(data)
  return jsonify(res)

@app.route('/check',methods=['GET','POST'])
def wordCheck():
  res = edict({})
  print request.data
  res.original = str(request.data)
  meaning = dictionary.meaning(request.data)
  # print meaning
  if meaning is None:
    res.isWord = 'false'
  else:
    # for key in meaning:
      # if key == 'Adjective':
      #   res.isWord = 'true'
      #   return jsonify(res) 
    res.isWord = 'true'
  return jsonify(res)

if __name__ == '__main__':
    print 'running app on port 5000'
    app.debug = True
    app.run()
