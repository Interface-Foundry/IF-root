# VERSION:        0.1
# REPO/TAG:       grahama/parsey:latest
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

FROM graham/parsey:latest

MAINTAINER grahama <graham.annett@gmail.com>

ADD src /root/

RUN cp /root/src/parser.sh /root/models/syntaxnet/syntaxnet/parser.sh

# start python services, follow dockerfile from old nlp folder