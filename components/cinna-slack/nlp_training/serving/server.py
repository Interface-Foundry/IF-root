from flask import Flask, request, jsonify
import logging
from serving import Predictor

port_num = 8085
app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


predictor = Predictor()

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    '''
    '''
    data.text = request.json['text']
