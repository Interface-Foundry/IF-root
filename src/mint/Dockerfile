#
# TO BUILD: build from the IF-root directory. all paths here are relative to that
#
FROM node:latest

# install some things
RUN npm install pm2 -g > /dev/null 2>&1
RUN npm install yarn -g > /dev/null 2>&1

# install root dependencies
RUN mkdir -p /opt/kip/node_module_staging_area/root
COPY package.json /opt/kip/node_module_staging_area/root/
COPY yarn.lock /opt/kip/node_module_staging_area/root/
WORKDIR /opt/kip/node_module_staging_area/root
RUN yarn > /dev/null 2>&1

# install mint dependencies
RUN mkdir -p /opt/kip/node_module_staging_area/mint
COPY src/mint/package.json /opt/kip/node_module_staging_area/mint
COPY src/mint/yarn.lock /opt/kip/node_module_staging_area/mint/
WORKDIR /opt/kip/node_module_staging_area/mint
RUN yarn > /dev/null 2>&1

# now copy all the files over
COPY . /opt/kip/

# link the node modules
RUN ln -sf -T /opt/kip/node_module_staging_area/mint/node_modules /opt/kip/src/mint/node_modules
RUN ln -sf -T /opt/kip/node_module_staging_area/root/node_modules /opt/kip/node_modules

# Build the front end
WORKDIR /opt/kip/src/mint
RUN yarn build > /dev/null 2>&1

# Expose the app
EXPOSE 3000

# Run the app
CMD pm2-docker server/index.js
