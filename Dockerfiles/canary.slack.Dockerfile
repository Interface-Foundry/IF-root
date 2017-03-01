FROM node:7
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=canary
ENV CONFIG_ENV=canary
ADD package.json /kip/package.json
RUN npm install -g yarn && yarn && touch /tmp/healthy
COPY src/ /kip
EXPOSE 8000
CMD node /kip/chat/components/slack/slack.js
