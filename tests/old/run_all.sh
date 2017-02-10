#!/bin/sh

export NODE_ENV=test
mocha onbored.js
mocha s1.js
mocha s2.js

