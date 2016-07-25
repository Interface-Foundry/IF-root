#!/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/ubuntu/root/IF_services/IF_forage/macys
echo 'Running bash script..'
tmux new-session -d -s macys
tmux new-window -t macys:1 -n 'Server1'
tmux send -t macys:1 "NODE_ENV=production xvfb-run -a node ~/root/IF_services/IF_forage/macys/macys_navigator.js" ENTER
tmux -2 attach-session -t macys