FROM node:latest

# install dumb-init for handling process signals
RUN apt-get install dumb-init

# install root dependencies
RUN mkdir -p /opt/kip/node_module_staging_area/root
COPY ../../package.json /opt/kip/node_module_staging_area/root/
COPY ../../yarn.lock /opt/kip/node_module_staging_area/root/
WORKDIR /opt/kip/node_module_staging_area/root
RUN yarn

# install mint dependencies
RUN mkdir -p /opt/kip/node_module_staging_area/mint
COPY ../../package.json /opt/kip/node_module_staging_area/mint
COPY ../../yarn.lock /opt/kip/node_module_staging_area/mint/
WORKDIR /opt/kip/node_module_staging_area/mint
RUN yarn

# now copy all the files over
COPY ../../ /opt/kip/

# link the node modules
RUN ln -s -T /opt/kip/node_module_staging_area/mint/node_modules /opt/kip/src/mint/node_modules
RUN ln -s -T /opt/kip/node_module_staging_area/root/node_modules /opt/kip/node_modules

# Build the front end
WORKDIR /opt/kip/src/mint
RUN yarn build

# Expose the app
EXPOSE 3000

# Run the app
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node" "server"]
