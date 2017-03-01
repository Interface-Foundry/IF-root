FROM node:7.6
RUN mkdir /kip
WORKDIR /kip
ENV NODE_ENV=canary
ENV CONFIG_ENV=canary
ADD package.json /kip/package.json
RUN yarn && touch /tmp/healthy
COPY src/ /kip
EXPOSE 8001
CMD node /kip/menus/menu_server.js
