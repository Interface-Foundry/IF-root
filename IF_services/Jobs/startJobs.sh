#!/bin/bash

export NODE_ENV=production

pm2 start job.js
pm2 start ../IF_forage/shoptiques/scrape_shoptiques.js
pm2 start ../IF_forage/shop/genericScraper.js