FROM python:3.4
MAINTAINER grahama <graham.annett@gmail.com>
ADD src/nlp_parser/requirements.txt  .
RUN pip install -qr requirements.txt
ADD src/nlp_parser/ /root/
WORKDIR /root
EXPOSE 8083
CMD gunicorn -w 3 --bind 0.0.0.0:8083 main:application