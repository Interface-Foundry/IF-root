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

RUN pip3 install keras pandas flask oauth2client google-api-python-client $TF_DOWNLOAD

ADD src_rnn /app

RUN mkdir /root/.keras/ && \
    echo '{"floatx": "float32", "epsilon": 1e-07, "backend": "tensorflow"}' > /root/.keras/keras.json

RUN wget -P /app/models/ https://storage.googleapis.com/saved-models-bucket/latest_model.hdf5 && \
    wget -P /app/models/ https://storage.googleapis.com/saved-models-bucket/latest_model.json && \
    wget -P /app/pkls/ https://storage.googleapis.com/saved-models-bucket/tokenizer.pkl && \
    wget -P /app/ https://storage.googleapis.com/saved-models-bucket/config.json

WORKDIR /app/

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/nlp_creds.json

EXPOSE 8085

ENTRYPOINT python3 server.py
