FROM node:7
RUN mkdir -p /kip/src/chat/components/dash/
WORKDIR /kip

ENV NODE_ENV=kubernetes
ENV CONFIG_ENV=kubernetes
ENV CONFIG_DIR=/kip/src/config

# NPM Install #1 (for kip et al)
ADD package.json /kip/package.json
RUN npm install

# NPM Install #2 (for dashboard module)
ADD src/chat/components/dash/package.json /kip/src/chat/components/dash/package.json
WORKDIR /kip/src/chat/components/dash/
RUN npm install

COPY src /kip/src
EXPOSE 30001

RUN node_modules/.bin/babel-node tools/run build
CMD node_modules/.bin/babel-node tools/run start
