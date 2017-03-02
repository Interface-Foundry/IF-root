import DataType from 'sequelize';
import Conn from '../sequelize';

const Delivery = Conn.define('delivery', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  active: {
    type:  DataType.BOOLEAN(),
  },

  session_id: {
    type: DataType.STRING(255)
  },

  team_id: {
    type: DataType.STRING(255)
  },

  onboarding: {
    type:  DataType.BOOLEAN(),
  },

  chosen_restaurant: {
    type: DataType.STRING(255)
  },

  budget: {
    type: DataType.STRING(255)
  },

  user_budgets: {
    type: DataType.STRING(255)
  },

  menu: {
    type: DataType.STRING(255)
  },

  chosen_channel: {
    type: DataType.STRING(255)
  },

  fulfillment_method: {
    type: DataType.STRING(255)
  },

  instructions: {
    type: DataType.STRING(255)
  },

  time_started: {
    type: DataType.DATE()
  },

  mode: {
    type: DataType.STRING(255)
  },

  action: {
    type: DataType.STRING(255)
  },

  data: {
    type: DataType.STRING(255)
  },

  delivery_post: {
    type: DataType.STRING(255)
  },

  order: {
    type: DataType.STRING(255)
  },

  tip: {
    type: DataType.STRING(255)
  },

  service_fee: {
    type: DataType.STRING(255)
  },

  coupon: {
    type: DataType.STRING(255)
  },

  main_amount: {
    type: DataType.STRING(255)
  },

  calculated_amount: {
    type: DataType.STRING(255)
  },

  discount_amount: {
    type: DataType.STRING(255)
  },

  payment_post: {
    type: DataType.STRING(255)
  },

  payment: {
    type: DataType.STRING(255)
  },

  guest_token: {
    type: DataType.STRING(255)
  },

  completed_payment: {
    type:  DataType.BOOLEAN(),
  },

  delivery_error: {
    type: DataType.STRING(255)
  },
  
},{
    timestamps: false,
     freezeTableName: true
});

export default Delivery;
