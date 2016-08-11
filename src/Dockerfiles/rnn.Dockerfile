# VERSION:        0.7.5
# REPO/TAG:       gcr.io/kip-styles/rnn:$VERSION
# DESCRIPTION:    trained LSTM model
# AUTHOR:         graham annett
# COMMENTS:
#
# SETUP:
#
# USAGE:
#

FROM ubuntu:16.04

MAINTAINER grahama

ENV TF_DOWNLOAD https://storage.googleapis.com/tensorflow/linux/cpu/tensorflow-0.9.0-cp35-cp35m-linux_x86_64.whl

RUN apt-get update && apt-get install -y \
    python3-dev \
    python3-pip \
    python3-numpy \
    libhdf5-dev \
    python3-h5py \
    wget

ADD nlp_rnn/src_rnn/requirments.txt /app/requirments.txt

RUN pip3 install $TF_DOWNLOAD && pip3 install -r /app/requirements.txt

RUN mkdir /root/.keras/ && \
    echo '{"floatx": "float32", "epsilon": 1e-07, "backend": "tensorflow"}' > /root/.keras/keras.json

RUN wget -P /app/models/ https://storage.googleapis.com/saved-models-bucket/latest_model.hdf5 && \
    wget -P /app/models/ https://storage.googleapis.com/saved-models-bucket/latest_model.json && \
    wget -P /app/pkls/ https://storage.googleapis.com/saved-models-bucket/tokenizer.pkl && \
    wget -P /app/ https://storage.googleapis.com/saved-models-bucket/config.json


WORKDIR /app/

COPY nlp_rnn/src_rnn /app

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/nlp_creds.json

EXPOSE 8085
# CMD python3 server.py
CMD gunicorn -w 3 --bind 0.0.0.0:8085 main:application
