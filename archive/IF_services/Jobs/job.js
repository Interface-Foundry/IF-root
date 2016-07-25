var db = require('db');
require('vvv');
var _ = require('lodash');

/**
 * API for creating jobs and queueing events.
 *
 * // example: just queue something up, let someone else process it
 * var scrapeShit = job('scrape-shit'); // get a queue
 * scrapeShit({url: 'http://shoptiques.com/shit'}) // use the queue
 *
 * // example: process something
 * var scrapeShit = job('scrape-shit', function(job, done) {
 *   request(job.url, function.....)
 *   ...
 *   done(null, outputData);
 * })
 *
 * @type {Function}
 */
var job = module.exports = function (opts, fn) {
    if (typeof opts === 'string') {
        opts = {
            name: opts
        };
    }

    if (typeof fn === 'function') {
        opts.fn = fn;
    }

    if (typeof opts.fn === 'function') {
        var j = new JobRunner(opts);
        console.log('Registered job handler for', opts.name);
        j.run();
    }

    /**
     * API for queueing events
     */
    return function(data) {
        (new db.Jobs({
            name: opts.name,
            inputData: data
        })).save(function(e) {
                if (e) {
                    console.error('Error saving job for', opts.name);
                }
            });
    }
}

function JobRunner(opts) {
    if (!(this instanceof JobRunner)) {
        return new JobRunner(opts);
    }

    var defaultOpts = {
        /**
         * The amount of milliseconds to wait before querying the db again when no results found
         * It will increase by a factor of 2 until it hits 1 hour.   Rests to 2000
         */
        coldWaitPeriod: 2000,

        /**
         * The amount to wait between successful jobs
         */
        waitPeriod: 1000
    };

    this.opts = _.merge(defaultOpts, opts);
    this.opts.coldWaitPeriod = Math.max(this.opts.coldWaitPeriod, 10);
    this.opts.currentColdWaitPeriod = this.opts.coldWaitPeriod;

    return this;
}

/**
 * Runs a job continuously
 */
JobRunner.prototype.run = function() {
    var me = this;

    log.v('looking for document in job queue', me.opts.name);
    db.Jobs.findOne({
        name: me.opts.name,
        'flags.complete': false,
        'flags.inProgress': false
    }).sort('-timestamps.created').exec(function(err, doc) {
        if (err) {
            console.error('Error finding document in mongodb for job', me.opts.name);
            console.error(err);
            process.exit(1);
        }

        if (!doc) {
            log.v('no doc found for job', me.opts.name, ' - waiting for', me.opts.currentColdWaitPeriod, 'milliseconds');
            // wait a while and then continue processing
            setTimeout(function() {
                if (me.opts.currentColdWaitPeriod <= 1000 * 60 * 60) {
                    me.opts.currentColdWaitPeriod = me.opts.currentColdWaitPeriod * 2;
                    log.vv('backing off cold wait period for', me.opts.name, 'to', me.opts.currentColdWaitPeriod)
                }
                me.run();
            }, me.opts.currentColdWaitPeriod)
        } else {
            log.v('found doc for job', me.opts.name);
            log.vv(doc);

            log.vv('resetting cold wait period to', me.opts.coldWaitPeriod);
            me.opts.currentColdWaitPeriod = me.opts.coldWaitPeriod;

            doc.timestamps.started = new Date();
            doc.flags.inProgress = true;
            doc.save(function(e) {
                if (e) {
                    console.error('Error saving document in mongodb for job', me.opts.name);
                    console.error(e);
                    process.exit(1);
                }
                try {
                    // try to run the job processing function they provided
                    me.opts.fn.call(null, doc.inputData, function (err, outputData) {
                        log.v('finished processing job', me.opts.name);
                          if (err) {
                          doc.flags.failed = true;
                          doc.flags.succeeded = false;
                        } else {
                          doc.flags.failed = false;
                          doc.flags.succeeded = true;
                        }
                        doc.flags.complete = true;
                        doc.flags.inProgress = false;
                        doc.timestamps.finished = new Date();
                        doc.outputData = err ? {err: err} : outputData;
                        log.vv(doc);
                        doc.save(function(e) {
                            if (e) {
                                console.error('Error saving document in mongodb for job', me.opts.name);
                                console.error(e);
                                process.exit(1);
                            }
                            setTimeout(function() {
                                me.run();
                            }, me.opts.waitPeriod);
                        })
                    })
                } catch (e) {
                    console.error('Error running job', me.opts.name);
                    console.error(e);
                    doc.flags.failed = true;
                    doc.flags.succeeded = false;
                    doc.flags.complete = true;
                    doc.flags.inProgress = false;
                    doc.timestamps.finished = new Date();
                    console.error(doc)

                    doc.save(function(e) {

                        if (e) {
                            console.error('Error saving document in mongodb for job', me.opts.name);
                            console.error(e);
                            process.exit(1);
                        }
                        setTimeout(function() {
                            me.run();
                        }, me.opts.waitPeriod);
                    })
                }
            })
        }


    })

}
