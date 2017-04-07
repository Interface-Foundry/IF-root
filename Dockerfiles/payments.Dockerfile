FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
EXPOSE 8080
CMD node /kip/payments/kip_pay.js
