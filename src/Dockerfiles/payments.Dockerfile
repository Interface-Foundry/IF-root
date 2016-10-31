FROM node:6
ENV NGINX_VERSION 1.10.2-1~jessie
RUN apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys 573BFD6B3D8FBC641079A6ABABF5BD827BD9BF62 \
    && echo "deb http://nginx.org/packages/debian/ jessie nginx" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get install --no-install-recommends --no-install-suggests -y \
                        ca-certificates \
                        nginx=${NGINX_VERSION} \
                        nginx-module-xslt \
                        nginx-module-geoip \
                        nginx-module-image-filter \
                        nginx-module-perl \
                        nginx-module-njs \
                        gettext-base \
    && rm -rf /var/lib/apt/lists/* && \
    apt-get update && \
    apt-get install -y nginx && \
    mkdir /kip
# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log
WORKDIR /kip
ENV NODE_ENV=production
ENV CONFIG_ENV=production
ADD package.json /kip/package.json
RUN npm install --production && \
    ln -s ../kip.js node_modules/kip.js && \
    ln -s ../db node_modules/db && \
    ln -s ../logging.js node_modules/logging.js
COPY . /kip
RUN mkdir -p /etc/nginx/ssl/pay_kipthis_com && \
    cp /kip/payments/nginx.conf /etc/nginx/nginx.conf && \
    cp /kip/payments/secrets/* /etc/nginx/ssl/pay_kipthis_com/
EXPOSE 80 443
CMD node /kip/payments/kip_pay.js