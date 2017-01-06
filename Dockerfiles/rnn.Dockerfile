FROM python:3.4
ADD src/nlp_rnn/requirements.txt /tmp/requirements.txt

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y -q libhdf5-dev wget
RUN pip install -r /tmp/requirements.txt

RUN mkdir /root/.keras/ && \
    echo '{"floatx": "float32", "epsilon": 1e-07, "backend": "tensorflow"}' > /root/.keras/keras.json

ADD src/nlp_rnn/ /nlp_rnn/

RUN wget -P /nlp_rnn/models/ https://storage.googleapis.com/saved-models-bucket/latest_model.hdf5 && \
    wget -P /nlp_rnn/models/ https://storage.googleapis.com/saved-models-bucket/latest_model.json && \
    wget -P /nlp_rnn/pkls/ https://storage.googleapis.com/saved-models-bucket/tokenizer.pkl && \
    wget -P /nlp_rnn/ https://storage.googleapis.com/saved-models-bucket/config.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/nlp_rnn/src/nlp_creds.json
EXPOSE 8085
WORKDIR /nlp_rnn/
CMD gunicorn --timeout 120 -w 2 --bind 0.0.0.0:8085 main:application