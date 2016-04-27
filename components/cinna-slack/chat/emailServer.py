import json 
from easydict import EasyDict as edict
from flask import (
    Flask,
    request,
    jsonify
)
import requests

app = Flask(__name__)

@app.route('/', methods=['POST'])
def parser():
  print "HTTP/1.1 200 OK"
  res = edict({})
  envelope = json.loads(request.form.get('envelope'))
  res.to_address = envelope['to'][0]
  res.from_address = envelope['from']
  res.text = request.form.get('text').splitlines()[0] 
  res.html = request.form.get('html')
  res.subject = request.form.get('subject')
  # [int(s) for s in text.split() if s.isdigit()][0]
  print res.text
  # res.num_attachments = int(request.form.get('attachments', 0))
  # res.attachments = []
  # if res.num_attachments > 0:
  #   for num in range(1, (res.num_attachments + 1)):
  #     attachment = request.files.get(('attachment%d' % num))
  #     res.attachments.append(attachment.read())
  jsonify(res)
  print res
  requests.post('http://localhost:8000/emailincoming', json=res)
  # return "OK"

if __name__ == '__main__':
    print 'running app on port 8091'
    app.run(port=8091, use_debugger=True, debug=True, use_reloader=False)
