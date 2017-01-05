# run with
# build w/
# docker run -it --rm --name webhooks -p 5000:5000 python-github-webhooks
FROM python:3.4
COPY . /app
RUN mkdir -p /root/.ssh/ && \
    mv /app/ssh_keys/id_rsa /root/.ssh/id_rsa && \
    chmod 0700 /root/.ssh && \
    ssh-keyscan github.com > /root/.ssh/known_hosts && \
    ssh-keyscan -H github.com  >> /root/.ssh/known_hosts && \
    ssh-keyscan gitlab.com  >> /root/.ssh/known_hosts && \
    ssh-keyscan -H gitlab.com  >> /root/.ssh/known_hosts && \
    chmod 0600 /root/.ssh/id_rsa && \
    chmod +x /app/hooks/push-dev

RUN git clone --mirror git@github.com:Interface-Foundry/IF-root.git /IF-root/

RUN cd /IF-root/ && \
    git remote set-url --push origin git@gitlab.com:kipthis/IF-root.git && \
    cat /IF-root/config

RUN pip install -r /app/requirements.txt
WORKDIR /app
EXPOSE 5000
CMD ["python", "webhook.py"]