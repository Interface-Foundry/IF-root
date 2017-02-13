import DataType from 'sequelize';
import Conn from '../sequelize';

const Message = Conn.define('message', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  thread_id: {
    type: DataType.STRING(255)
  },

  origin: {
    type: DataType.STRING(255)
  },

  mode: {
    type: DataType.STRING(255)
  },

  action: {
    type: DataType.STRING(255)
  },

  team: {
    type: DataType.STRING(255)
  },

  channel: {
    type: DataType.STRING(255)
  },

  user: {
    type: DataType.STRING(255)
  },

  user_id: {
    type: DataType.STRING(255)
  },

  cart_reference_id: {
    type: DataType.STRING(255)
  },

  incoming: {
    type: DataType.BOOLEAN()
  },

  original_text: {
    type: DataType.STRING(255)
  },

  text: {
    type: DataType.STRING(255)
  },

  original_query: {
    type: DataType.STRING(255)
  },

  url_shorten: {
    type: DataType.ARRAY(DataType.STRING(255))
  },

  ts: {
    type: DataType.DATE()
  },

  source_ts: {
    type: DataType.STRING(255)
  },

  slack_ts: {
    type: DataType.STRING(255)
  },

  replace_ts: {
    type: DataType.STRING(255)
  },

  action_ts: {
    type: DataType.STRING(255)
  },

  amazon: {
    type: DataType.JSON()
  }

},{
    timestamps: false
});

export default Message;
