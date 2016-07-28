FROM node:6
RUN mkdir /kip
WORKDIR /kip
ENV CONFIG_ENV=kip-ai
ADD package.json /kip/package.json
RUN npm install --production && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db
COPY . /kip
EXPOSE 27017
CMD node /kip/chat/components/reply_logic.js