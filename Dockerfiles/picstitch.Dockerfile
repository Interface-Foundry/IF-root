FROM python:3.4
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y -q libfreetype6-dev
ADD src/image_processing/requirements.txt /tmp/requirements.txt
RUN pip install -qr /tmp/requirements.txt
ADD src/image_processing /image_processing/
ENV AWS_ACCESS_KEY_ID=AKIAJEYXGEUG37OMIQKA
ENV AWS_SECRET_ACCESS_KEY=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
ENV GOOGLE_APPLICATION_CREDENTIALS=/image_processing/gcloud_key/gcloud-picstitch.json
EXPOSE 5000
WORKDIR /image_processing
ENTRYPOINT ["/usr/local/bin/gunicorn", "--config", "/image_processing/gunicorn.conf.py", "main:application"]
