#!/bin/bash
kill -9 `lsof -i :5858 | tail -1 | grep -o '[0-9]\+' | head -1`

node debug reply_logic.js

