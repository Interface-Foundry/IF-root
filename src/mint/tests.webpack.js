'use strict';

require('babel-polyfill');

// this regex matches any js files in __tests__ directories
var context = require.context('.', true, /__tests__\/.+\.js$/);
context.keys().forEach(context);