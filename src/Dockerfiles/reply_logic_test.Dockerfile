FROM node:6

ENV NODE_ENV=development_nlp

RUN mkdir /kip

ADD package.json /kip/package.json

WORKDIR /kip

RUN npm install && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db

COPY . /kip

CMD node /kip/chat/components/reply_logic.js
