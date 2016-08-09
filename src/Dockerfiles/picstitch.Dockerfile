FROM python:3

RUN apt-get update

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q python3-all python3-pip libfreetype6-dev

ADD image_processing/requirements.txt /tmp/requirements.txt

RUN pip3 install -qr /tmp/requirements.txt

ADD image_processing /picstitch/

WORKDIR /picstitch

EXPOSE 5000

ENV AWS_ACCESS_KEY_ID=AKIAJEYXGEUG37OMIQKA

ENV AWS_SECRET_ACCESS_KEY=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

ENV GOOGLE_APPLICATION_CREDENTIALS=/picstitch/gcloud_key/KipStyles-8da42a8a7423.json

# CMD python3 server.py
CMD gunicorn -w 3 --bind 0.0.0.0:5000 main:application