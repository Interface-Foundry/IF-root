/**
 * @module Deals defines a job which gets the daily amazon deals off of the site https://camelcamelcamel.com once per day
 * @type {[type]}
 */

var scrape = require('./scrapeCamel');
var CronJob = require('cron').CronJob;

console.log('setting up the deal scraper to run at 2:15 am +/- 45 minutes M-F')
var job = new CronJob('00 30 1 * * 1-5', function() {
  /*
   * Runs every weekday (Monday through Friday)
   * at 1:30:00 AM +/- a few minutes so that it's sneakier
   */
  var randomMinutes = Math.random()*90
  setTimeout(() => {
    console.log('running the scraper')
    scrape().then(r => {
      console.log('scraped camel successfully at ' + new Date())
    }).catch(e => {
      console.error('error scraping camel at ' + new Date(), e)
    })
  }, 1000 * randomMinutes | 0)

  },
  true /* Start the job right now */
);
