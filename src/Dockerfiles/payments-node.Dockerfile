FROM node:6
WORKDIR /kip
ENV NODE_ENV=production
ADD package.json /kip/package.json
RUN npm install --production && \
    ln -s ../kip.js node_modules/kip.js && \
    ln -s ../db node_modules/db && \
    ln -s ../logging.js node_modules/logging.js
COPY . /kip
EXPOSE 8080
CMD service nginx restart && node /kip/payments/kip_pay.js
