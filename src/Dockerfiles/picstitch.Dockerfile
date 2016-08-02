FROM python:2

RUN apt-get update

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q python-all python-pip

ADD image_processing/requirements.txt /tmp/requirements.txt

RUN pip install -qr /tmp/requirements.txt

ADD image_processing /opt/picstitch/

WORKDIR /opt/picstitch

EXPOSE 5000

ENV AWS_ACCESS_KEY_ID=AKIAJEYXGEUG37OMIQKA

ENV AWS_SECRET_ACCESS_KEY=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

CMD ["python", "picstitch.py"]
