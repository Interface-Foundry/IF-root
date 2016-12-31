FROM ubuntu:16.04
ADD https://github.com/Yelp/dumb-init/releases/download/v1.0.2/dumb-init_1.0.2_amd64 /usr/bin/dumb-init
ADD gitlab-ci-multi-runner_amd64.deb /tmp/gitlab-ci-multi-runner_amd64.deb
RUN chmod +x /usr/bin/dumb-init
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y ca-certificates wget apt-transport-https vim nano git curl kmod && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN dpkg -i /tmp/gitlab-ci-multi-runner_amd64.deb; \
    apt-get update &&  \
    apt-get -f install -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm /tmp/gitlab-ci-multi-runner_amd64.deb && \
    gitlab-runner --version && \
    wget -q https://github.com/docker/machine/releases/download/v0.7.0/docker-machine-Linux-x86_64 -O /usr/bin/docker-machine && \
    chmod +x /usr/bin/docker-machine && \
    mkdir -p /etc/gitlab-runner/certs && \
    chmod -R 700 /etc/gitlab-runner
COPY entrypoint /
RUN chmod +x /entrypoint
ENTRYPOINT ["/usr/bin/dumb-init", "/entrypoint"]