FROM node:6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=production
ADD package.json /kip/package.json
RUN npm install --silent --production && ln -s ../kip.js node_modules/kip.js && ln -s ../db node_modules/db
COPY . /kip
EXPOSE 8000
CMD node chat/components/web/app.js
