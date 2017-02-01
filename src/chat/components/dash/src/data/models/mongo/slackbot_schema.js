var mongoose = require('mongoose')

/**
 * Save slackbot integrations
 */
var slackbotSchema = mongoose.Schema({
  //
  // stuff we get from slack
  //
  access_token: String,
  scope: String,
  team_name: String,
  team_id: {
    type: String,
    unique: true
  },
  incoming_webhook: {
    url: String,
    channel: String,
    configuration_url: String
  },
  bot: {
    bot_user_id: String,
    bot_access_token: String
  },
  //
  // this is all kip-specific stuff
  //
  meta: {
    dateAdded: {
      type: Date,
      default: Date.now
    },
    addedBy: String,
    initialized: {
      type: Boolean,
      default: false
    },
    office_assistants: [String], // user ids of the office assistants, like U0R6H9BKN
    status_interval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'weekly'
    },
    cron_jobs: {},
    //no longer weekly per se but keeping it for now
    weekly_status_enabled: {
      type: Boolean,
      default: true
    },
    weekly_status_day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: 'Friday'
    },
    weekly_status_date: {
      type: Number
    },
    weekly_status_time: {
      type: String,
      default: '4:00 PM'
    },
    weekly_status_timezone: {
      type: String,
      default: 'America/New_York'
    },
    city: {
      type: String
    },
    all_channels: [{
      id: String,
      name: String,
      is_channel: { // if a group its different from a channel
        type: Boolean,
        default: true
      }
    }],
    collect_from: {
      type: String,
      enum: ['me', 'all', 'channel'],
      default: 'all'
    },
    cart_channels: [String],
    deleted: {
      type: Boolean,
      default: false
    },
    locations: [{
      label: String,
      latitude: Number,
      longitude: Number,
      address_1: String,
      address_2: String,
      street: String,
      unit_type: String,
      unit_number: String,
      city: String,
      state: String,
      zip_code: String,
      phone_number: String,
      region: String,
      timezone: String,
      neighborhood: String,
      sublocality: String,
      special_instructions: String,
      input: String,
      budgets: {
        type: [Number],
        default: [10, 15, 20]
      },
      budget_history: {
        type: [Number],
        default: [10, 15, 20]
      }
    }],
    chosen_location: {},
    fulfillment_method: String,
    payments: [{
      vendor: String,
      customer_id: String,
      card: {
        card_id: String,
        brand: String, // visa, mastercard, etc
        exp_month: String, // expiration date
        exp_year: String,
        last4: String,
        email: String,
        address_zip: String
      }
    }],
    mock: Boolean,
    p2p: Boolean,
    used_coupons: Number
  },
  // hash of channel:type conversations, for instance { D340852K: 'onboarding' }
  conversaitons: {}
})

var Slackbot = mongoose.model('Slackbot', slackbotSchema, 'slackbots')

module.exports = Slackbot
