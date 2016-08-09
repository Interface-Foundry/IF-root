FROM gcr.io/kip-ai/nlp:base

MAINTAINER grahama <graham.annett@gmail.com>

RUN apt update && apt install -y python3-pip && pip3 install flask easydict gunicorn

ADD nlp_parser/src_parser /root/

RUN chmod +x /root/parser.sh

WORKDIR /root

EXPOSE 8083

CMD gunicorn -w 1 --bind 0.0.0.0:8083 main:application