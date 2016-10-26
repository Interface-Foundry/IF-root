FROM node:6
RUN mkdir /kip
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
CMD node /kip/payments/kip_pay.js