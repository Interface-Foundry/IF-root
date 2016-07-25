var mongoose = require('mongoose');

/**
 * Log job for job feeds
 */
var jobSchema = mongoose.Schema({
    name: String,

    // Timestamps
    timestamps: {
        created: {
            type: Date,
            default: Date.now
        },

        started: {
            type: Date
        },

        finished: {
            type: Date
        }
    },


    // Flags
    flags: {
        inProgress: {
            type: Boolean,
            default: false
        },

        complete: {
            type: Boolean,
            default: false
        },

        succeeded: {
            type: Boolean,
            default: false
        },

        failed: {
            type: Boolean,
            default: false
        }
    },

    // free-form data
    inputData: {},
    outputData: {}
});

var Job = mongoose.model('Job', jobSchema, 'jobs');

module.exports = Job;