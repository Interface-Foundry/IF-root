FROM ubuntu:16.04

MAINTAINER grahama

EXPOSE 8000

EXPOSE 27017

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

ADD . /app/

RUN cd /app/components/cinna-slack && npm install .

WORKDIR /app/components/cinna-slack

RUN echo '#!/bin/bash' > run.sh && \
    echo 'pm2 start --no-daemon app.json && pm2 logs all' >> run.sh && \
    chmod +x run.sh

# CMD ./run.sh