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
    text = request.json['text']

    predictor.return_predictions(text)

if __name__ == '__main__':
    logging.info('running app on port ' + str(port_num))
    app.run(host="0.0.0.0",
            port=port_num,
            use_debugger=True,
            debug=True,
            use_reloader=False)

