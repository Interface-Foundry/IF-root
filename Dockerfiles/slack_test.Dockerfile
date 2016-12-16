FROM node:6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=production
ENV CONFIG_ENV=kip_ai
ADD package.json /kip/package.json
RUN npm install --production && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db && ln -s ../logging.js node_modules/logging.js
COPY src/ /kip
CMD node /kip/chat/components/slack/slack.js
