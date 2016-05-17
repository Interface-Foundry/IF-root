FROM python:2
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y -q python-all python-pip
ADD ./requirements.txt /tmp/requirements.txt
RUN pip install -qr /tmp/requirements.txt
ADD . /opt/picstitch/
WORKDIR /opt/picstitch
EXPOSE 5000
CMD ["python", "picstitch.py"]
