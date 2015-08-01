#!/bin/bash

export MONGOPW='XsplKfnFoznVwgG2tE81iJ5GmU2PXqtyatDSt5Jpf1h'
export NODE_ENV='production'

pm2 kill

sleep 5

pm2 start IF_server.js -i 0
pm2 start IF_services/IF_instagram_REST_processer/IF_instagram_server.js
pm2 start IF_services/IF_tweet_REST_processer/IF_tweet_server.js

