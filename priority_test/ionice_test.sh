#!/bin/bash

# bad process
DOG_NAME=bailey ionice -c 3 node server-io.js &

# good process
DOG_NAME=sparky ionice -c 1 node server-io.js &

