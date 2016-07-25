FROM python:2
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q python-all python-pip
ADD ./requirements.txt /tmp/requirements.txt
RUN pip install -qr /tmp/requirements.txt
RUN python -m textblob.download_corpora
RUN python -m spacy.en.download all --force
ADD . /opt/nlp/
WORKDIR /opt/nlp
EXPOSE 8083
CMD ["python", "server.py"]
