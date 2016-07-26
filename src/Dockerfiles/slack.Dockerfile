FROM node:6

ENV NODE_ENV=development_nlp

RUN mkdir /kip/

ADD package.json /kip/

WORKDIR /kip/

RUN npm install

ADD . /kip/

RUN ln -sf kip.js node_modules/kip.js && ln -sf db node_modules/db

EXPOSE 8000

EXPOSE 27017

CMD node /kip/chat/components/slack/slack.js