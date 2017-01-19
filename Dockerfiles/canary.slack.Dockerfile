FROM node:6
RUN mkdir /kip
WORKDIR /kip
ADD package.json /kip/package.json
ENV NODE_ENV=canaryk8s
ENV CONFIG_ENV=canaryk8s
RUN npm install --canaryk8s && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db && ln -s ../logging.js node_modules/logging.js
COPY src/ /kip
EXPOSE 8000
CMD node /kip/chat/components/slack/slack.js
