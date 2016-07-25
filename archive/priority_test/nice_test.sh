#!/bin/bash

# bad process
DOG_NAME=bailey node server.js &
bad_pid=$$

# good process
DOG_NAME=sparky node server.js &

# change bad process to lower priority
sudo renice -n 10 -p $bad_pid
