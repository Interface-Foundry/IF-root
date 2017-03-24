FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=kubernetes
ENV CONFIG_ENV=kubernetes
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
CMD node /kip/chat/components/reply_logic.js
