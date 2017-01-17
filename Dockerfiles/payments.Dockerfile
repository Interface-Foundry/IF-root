FROM node:6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=production_payments
ENV CONFIG_ENV=production_payments
ADD package.json /kip/package.json
COPY src/ /kip
RUN npm install --production_payments && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db && ln -s ../logging.js node_modules/logging.js
EXPOSE 8080
CMD node /kip/payments/kip_pay.js