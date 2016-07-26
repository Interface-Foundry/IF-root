FROM node:6

ENV NODE_ENV=development_nlp

RUN mkdir /kip

ADD package.json /kip/package.json

WORKDIR /kip

RUN npm install --production && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db

ADD . /kip/

RUN ln -sf kip.js node_modules/kip.js && ln -sf db node_modules/db

EXPOSE 8000

CMD node /kip/chat/components/slack/slack.js