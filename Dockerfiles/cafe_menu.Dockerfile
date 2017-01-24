FROM node:7
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=canaryk8s
ENV CONFIG_ENV=canaryk8s
ADD package.json /kip/package.json
RUN npm install -g yarn && yarn
COPY src/ /kip
EXPOSE 8001
CMD node /kip/menus/menu_server.js
