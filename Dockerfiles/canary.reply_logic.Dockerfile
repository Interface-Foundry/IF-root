FROM node:7
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=canaryk8s
ENV CONFIG_ENV=canaryk8s
ADD package.json /kip/package.json
RUN npm install -g yarn && yarn && ln -s kip/logging.js kip/node_modules/logging.js
COPY src/ /kip
CMD node /kip/chat/components/reply_logic.js
