#!/bin/bash

CMD="cd IF-root && git stash && git pull --rebase && npm install mmmagic && pm2 restart all"

ssh kip@web-server-charmander.kipapp.co "$CMD"
ssh kip@web-server-squirtle.kipapp.co "$CMD"
