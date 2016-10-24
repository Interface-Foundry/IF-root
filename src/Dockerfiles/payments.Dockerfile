FROM node:6
RUN mkdir /payments
WORKDIR /payments
ENV NODE_ENV=production
ENV CONFIG_ENV=production
ADD package.json /payments/package.json
RUN npm install --production && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db
COPY payments/ .
CMD node /payments/kip_pay.js