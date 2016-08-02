FROM node:5
EXPOSE 8000
ADD . /opt/kip/
WORKDIR /opt/kip
RUN npm install
WORKDIR /opt/kip/components/cinna-slack/chat
RUN npm install
EXPOSE 8000
ENV NODE_ENV=production
CMD ["node", "server_cinna_chat.js"]
