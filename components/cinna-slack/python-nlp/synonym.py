from easydict import EasyDict as edict
from PyDictionary import PyDictionary
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
  res.synonyms = dictionary.synonym(res.original)
  return jsonify(res)

@app.route('/check',methods=['GET','POST'])
def wordCheck():
  res = edict({})
  print request.data
  res.original = str(request.data)
  meaning = dictionary.meaning(request.data)
  print meaning
  if meaning is None:
    res.isWord = 'false'
  else:
    res.isWord = 'true'
  return jsonify(res)

if __name__ == '__main__':
    print 'running app on port 5000'
    app.debug = True
    app.run()
