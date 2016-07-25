# VERSION:        0.1
# REPO/TAG:       test:NLP
# DESCRIPTION:    testing in dockerfile for NLP based stuff
# AUTHOR:         graham annett
# COMMENTS:
#     since building parsey locally is not feasible for most machines and the
#     testing layer can be made so it is written upon the NLP layer of stuff
# SETUP:
#
# USAGE:
#   to run all tests: docker run test:NLP

FROM grahama/kip:nlp

MAINTAINER grahama <graham.annett@gmail.com>

RUN pip install -U pytest

ADD tests /root/tests

CMD ["py.test", "/root/tests"]