import DataType from 'sequelize';
import Conn from '../sequelize';
import Delivery from './Delivery';
import Chatuser from './Chatuser';
import Cart from './Cart';


const Slackbot = Conn.define('slackbot', {
  id: {
    type: DataType.STRING(255)
  },

  team_id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  access_token: {
    type: DataType.STRING(255)
  },

  scope: {
    type: DataType.STRING(255)
  },

  team_name: {
    type: DataType.STRING(255)
  },

  incoming_webhook_url: {
    type: DataType.STRING(255)
  },

  incoming_webhook_channel: {
    type: DataType.STRING(255)
  },

  bot_user_id: {
    type: DataType.STRING(255)
  },

  bot_access_token: {
    type: DataType.STRING(255)
  },

  dateAdded: {
    type: DataType.DATE()
  },

  addedBy: {
    type: DataType.STRING(255)
  },

  initialized: {
    type:  DataType.BOOLEAN(),
  },

  office_assistants: {
    type: DataType.ARRAY(DataType.STRING(255))
  },

  status_interval: {
    type: DataType.STRING(255)
  },

  weekly_status_enabled: {
    type:  DataType.BOOLEAN(),
  },

  weekly_status_day: {
    type:  DataType.STRING(255)
  },

  weekly_status_date: {
    type: DataType.STRING(255)
  },

  weekly_status_time: {
    type: DataType.STRING(255)
  },

  weekly_status_timezone: {
    type: DataType.STRING(255)
  },

  city: {
    type: DataType.STRING(255)
  },

  cart_channels: {
    type: DataType.ARRAY(DataType.STRING(255))
  },

  collect_from: {
    type: DataType.STRING(255)
  },

  deleted: {
    type:  DataType.BOOLEAN(),
  },

  chosen_location: {
    type: DataType.STRING(255)
  },

  fulfillment_method: {
    type: DataType.STRING(255)
  },

  mock: {
    type:  DataType.BOOLEAN(),
  },

  p2p: {
    type:  DataType.BOOLEAN(),
  },

  used_coupons: {
    type: DataType.STRING(255)
  },
  
},{
    timestamps: false
});

Slackbot.Deliveries = Slackbot.hasMany(Delivery, { as: 'food_sessions', foreignKey: 'team_id'});
Delivery.Team = Delivery.belongsTo(Slackbot, { as: 'team', foreignKey: 'team_id'});
Slackbot.Members = Slackbot.hasMany(Chatuser, { as: 'members', foreignKey: 'team_id'});
Chatuser.Team = Chatuser.belongsTo(Slackbot, { as: 'team', foreignKey: 'team_id'});
Slackbot.Carts = Slackbot.hasMany(Cart, { as: 'carts', foreignKey: 'slack_id'});
Cart.Team = Cart.belongsTo(Slackbot, { as: 'team', foreignKey: 'slack_id'});

export default Slackbot;
