FROM gcr.io/kip-styles/parser:base

MAINTAINER grahama <graham.annett@gmail.com>

ADD nlp_parser/src_parser/requirements.txt  .

RUN apt update && apt install -y python3-pip  && pip3 install -qr requirements.txt

ADD nlp_parser/src_parser /root/

RUN chmod +x /root/parser.sh

WORKDIR /root

EXPOSE 8083

ENV GOOGLE_APPLICATION_CREDENTIALS /root/gcloud_key/KipStyles-cc4206727706.json

CMD gunicorn -w 5 --bind 0.0.0.0:8083 main:application