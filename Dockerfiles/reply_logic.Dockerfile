FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
CMD node /kip/chat/components/reply_logic.js
