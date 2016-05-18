FROM node:5
EXPOSE 8000
ADD . /opt/kip/
WORKDIR /opt/kip
RUN npm install
EXPOSE 8000
ENV NODE_ENV=development
CMD ["node", "chat/server_cinna_chat.js"]
