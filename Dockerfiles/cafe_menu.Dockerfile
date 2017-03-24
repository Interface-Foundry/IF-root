FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=kubernetes
ENV CONFIG_ENV=kubernetes
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
EXPOSE 8001
CMD node /kip/menus/menu_server.js
