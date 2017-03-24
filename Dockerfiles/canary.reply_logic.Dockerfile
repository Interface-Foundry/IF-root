FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=canary
ENV CONFIG_ENV=canary
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
CMD node /kip/chat/components/reply_logic.js
