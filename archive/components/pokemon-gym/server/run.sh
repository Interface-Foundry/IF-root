#!/bin/bash

pm2 stop gym
pm2 delete gym

NODE_ENV=production pm2 start app.js --name gym
