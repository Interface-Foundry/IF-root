FROM node:6

ENV NODE_ENV=development_nlp

ADD package.json /kip/

RUN cd /kip/ && npm install

ADD . /kip/

EXPOSE 8000

EXPOSE 27017

CMD node /kip/chat/components/reply_logic.js