FROM node:7.6
WORKDIR /
COPY package.json /package.json
COPY /src/ /src/
RUN yarn
RUN cd /src/ && yarn && cd /src/dash/ && yarn
RUN cd /src/dash/ && yarn build -- --release
EXPOSE 3000
CMD node /src/dash/build/server.js