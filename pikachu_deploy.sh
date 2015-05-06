#!/bin/bash

set -e

# snatch latest bubblli code
git fetch origin && git reset --hard Bubblli

# redeploy
pm2 restart IF_server
