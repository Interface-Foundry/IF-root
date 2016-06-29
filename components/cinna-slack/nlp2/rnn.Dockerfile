# VERSION:        0.1
# REPO/TAG:       kip/nlp:rnn
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
    python3-h5py

RUN pip3 install keras pandas $TF_DOWNLOAD