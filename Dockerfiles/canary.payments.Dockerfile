FROM node:7
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=canary
ENV CONFIG_ENV=canary
ADD package.json /kip/package.json
RUN npm install -g yarn && yarn
COPY src/ /kip
EXPOSE 8080
CMD node /kip/payments/kip_pay.js
