FROM ubuntu:16.04

MAINTAINER grahama

RUN apt-get update && apt-get -y install \
    build-essential \
    libkrb5-dev \
    curl \
    git \
    vim \
    wget \
    python \
    python-dev \
    python-setuptools && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt-get install -y nodejs &&  \
    npm install -g pm2 && \
    mkdir -p /app/

WORKDIR /app/

ADD . /app/


RUN npm uninstall bufferutil && npm install -g bufferutil node-inspector && \
    npm install -g

EXPOSE 8000
EXPOSE 27017


