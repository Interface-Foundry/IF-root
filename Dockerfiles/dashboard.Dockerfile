FROM node:7
RUN mkdir -p /kip/src/chat/components/dash/src
WORKDIR /kip/src/chat/components/dash
ENV NODE_ENV=kubernetes
ENV CONFIG_ENV=kubernetes
ADD src/chat/components/dash/package.json /kip/src/chat/components/dash/package.json
RUN npm install
COPY src /kip/src
EXPOSE 30001
RUN /kip/src/chat/components/dash/node_modules/.bin/babel-node tools/run build
CMD /kip/src/chat/components/dash/node_modules/.bin/babel-node tools/run start
