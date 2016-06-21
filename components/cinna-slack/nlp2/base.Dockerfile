# VERSION:        0.3
# REPO/TAG:       grahama/parsey:latest
# DESCRIPTION:    parsey
# AUTHOR:         graham annett
# COMMENTS:
#     parsey with tensorflow, not using GPU
# SETUP:
#
# USAGE:
#

FROM ubuntu:15.10

MAINTAINER grahama <graham.annett@gmail.com>

RUN echo "startup --batch" >>/root/.bazelrc
# Similarly, we need to workaround sandboxing issues:
#   https://github.com/bazelbuild/bazel/issues/418
RUN echo "build --spawn_strategy=standalone --genrule_strategy=standalone" \
    >>/root/.bazelrc
ENV BAZELRC /root/.bazelrc
ENV BAZEL_VERSION 0.2.2


RUN apt-get update && apt-get install -y \
        build-essential \
        curl \
        g++ \
        git \
        libfreetype6-dev \
        libpng12-dev \
        libzmq3-dev \
        openjdk-8-jdk \
        pkg-config \
        python-dev \
        python-numpy \
        python-pip \
        software-properties-common \
        swig \
        unzip \
        zip \
        zlib1g-dev \
        vim \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates -f && \
    pip install -U protobuf==3.0.0b2 && \
    pip install -U asciitree spacy easydict flask textblob && \
    python -m spacy.en.download

# Set up Bazel.

# Running bazel inside a `docker build` command causes trouble, cf:
#   https://github.com/bazelbuild/bazel/issues/134
# The easiest solution is to set up a bazelrc file forcing --batch.
WORKDIR /
RUN mkdir /bazel && \
    cd /bazel && \
    curl -fSsL -O https://github.com/bazelbuild/bazel/releases/download/$BAZEL_VERSION/bazel-$BAZEL_VERSION-installer-linux-x86_64.sh && \
    curl -fSsL -o /bazel/LICENSE.txt https://raw.githubusercontent.com/bazelbuild/bazel/master/LICENSE.txt && \
    chmod +x bazel-*.sh && \
    ./bazel-$BAZEL_VERSION-installer-linux-x86_64.sh && \
    cd / && \
    rm -f /bazel/bazel-$BAZEL_VERSION-installer-linux-x86_64.sh

# Download and build Syntaxnet
RUN git clone --recursive https://github.com/tensorflow/models.git /root/models && \
    cd /root/models/syntaxnet/tensorflow && echo | ./configure && \
    cd /root/models/syntaxnet && bazel test syntaxnet/... util/utf8/...

WORKDIR /root/