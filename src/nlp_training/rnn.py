import requests

def return_predictions(text):
    i = {'text': text}
    r = requests.post('http://0.0.0.0:5000', json=i)
    return r.text