FROM node:6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=production
ENV CONFIG_ENV=development_nlp
ADD package.json /kip/package.json
RUN npm install --production && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db
COPY . /kip
CMD node /kip/chat/components/reply_logic.js