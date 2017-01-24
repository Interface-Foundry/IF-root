FROM node:7
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=kubernetes
ENV CONFIG_ENV=kubernetes
ADD package.json /kip/package.json
RUN npm install -g yarn && yarn
COPY src/ /kip
EXPOSE 8000
CMD node /kip/chat/components/slack/slack.js
