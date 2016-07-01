# VERSION:        0.1
# REPO/TAG:       grahama/kip:latest
# DESCRIPTION:    using parsey but able to build upon locally
# AUTHOR:         graham annett
# COMMENTS:
#     the actual base is from my personal dockerbuilds: https://gitlab.com/besiktas/dockerbuilds
#     due to the requirements to build though (seems to need 12+gb of RAM, I am building remote
#     and then pulling and building the final layer here
# SETUP:
#
#   UBUNTU:
#   MAC:
#
# USAGE:
#

FROM gcr.io/kip-ai/nlp:base

MAINTAINER grahama <graham.annett@gmail.com>

ADD src_parser /root/

RUN chmod +x /root/parser.sh

WORKDIR /root

# start python services, follow dockerfile from old nlp folder
ENTRYPOINT python server.py