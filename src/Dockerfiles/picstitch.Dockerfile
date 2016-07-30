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

CMD python3 picstitch.py