FROM ubuntu:16.04

MAINTAINER grahama

ENV TF_DOWNLOAD https://storage.googleapis.com/tensorflow/linux/cpu/tensorflow-0.9.0-cp35-cp35m-linux_x86_64.whl

RUN apt-get update && apt-get install -y python3-dev python3-pip libhdf5-dev

RUN pip3 install keras h5py pandas

RUN pip3 install $TF_DOWNLOAD