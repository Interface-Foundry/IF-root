FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
EXPOSE 8000
CMD node /kip/chat/components/slack/slack.js
