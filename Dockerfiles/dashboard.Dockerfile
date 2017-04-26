FROM node:7.6
ENV CONFIG_DIR /src/config
WORKDIR /
COPY package.json /package.json
COPY /src/ /src/
RUN yarn
RUN cd /src/ && yarn && cd /src/dash/ && yarn
RUN cd /src/dash/ && yarn build -- --release --max_old_space_size=5120
EXPOSE 3000
ENV CONFIG_ENV 'development_nlp'
ENV NODE_ENV 'development_nlp'
CMD node /src/dash/build/server.js