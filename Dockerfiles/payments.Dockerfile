FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=kubernetes
ENV CONFIG_ENV=kubernetes
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
EXPOSE 8080
CMD node /kip/payments/kip_pay.js
