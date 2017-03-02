import DataType from 'sequelize';
import Conn from '../sequelize';
// import Waypoint from './Waypoint';

const Chatuser = Conn.define('chatuser', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  user_id: {
    type: DataType.STRING(255),
    primaryKey: true,
  },

  platform: {
    type: DataType.STRING(255)
  },

  onboarded: {
    type: DataType.BOOLEAN()
  },

  admin_shop_onboarded: {
    type:DataType.BOOLEAN()
  },

  member_shop_onboarded: {
    type: DataType.BOOLEAN()
  },

  ts: {
    type: DataType.STRING(255)
  },

  origin: {
    type: DataType.STRING(255)
  },

  type: {
    type: DataType.STRING(255)
  },

  dm: {
    type: DataType.STRING(255)
  },

  team_id: {
    type: DataType.STRING(255)
  },

  name: {
    type: DataType.STRING(255)
  },

  deleted: {
    type: DataType.BOOLEAN()
  },

  color: {
    type:  DataType.STRING(255)
  },

  real_name: {
    type:  DataType.STRING(255)
  },

  tz: {
    type:  DataType.STRING(255)
  },

  tz_label: {
    type:  DataType.STRING(255)
  },

  tz_offset: {
    type:  DataType.STRING(255)
  },

  country: {
    type:  DataType.STRING(255)
  },

  is_admin: {
    type: DataType.BOOLEAN()
  },

  is_owner: {
    type: DataType.BOOLEAN()
  },

  is_primary_owner: {
    type: DataType.BOOLEAN()
  },

  is_restricted: {
    type: DataType.BOOLEAN()
  },

  is_ultra_restricted: {
    type: DataType.BOOLEAN()
  },

  is_bot: {
    type: DataType.BOOLEAN()
  },

  has_2fa: {
    type: DataType.BOOLEAN()
  },

  last_call_alerts: {
    type: DataType.BOOLEAN()
  },

  emailNotification: {
    type: DataType.BOOLEAN()
  },

  awaiting_email_response: {
    type: DataType.BOOLEAN()
  },

  phone_number: {
    type:  DataType.STRING(255)
  },

  first_name: {
    type:  DataType.STRING(255)
  },

  last_name: {
    type:  DataType.STRING(255)
  },
  
},{
    timestamps: false
});

// Chatuser.Waypoints = Chatuser.hasMany(Waypoint, { as: 'waypoints', foreignKey: 'user_id'});


export default Chatuser;
