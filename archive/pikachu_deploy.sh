#!/bin/bash

set -e

# snatch latest kip code
git fetch origin && git pull --rebase

# redeploy
pm2 restart IF_server
