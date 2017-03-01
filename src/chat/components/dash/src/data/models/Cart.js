import DataType from 'sequelize';
import Conn from '../sequelize';
import Item from './Item';
import Slackbot from './Slackbot';


const Cart = Conn.define('cart', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  slack_id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  items: {
    type: DataType.ARRAY(DataType.JSON())
  },

  purchased: {
    type:  DataType.BOOLEAN(),
  },

  deleted: {
    type:  DataType.BOOLEAN(),
  },

  created_date: {
    type: DataType.STRING(255)
  },

  purchased_date: {
    type: DataType.STRING(255)
  },

  type: {
    type: DataType.STRING(255)
  },

  link: {
    type: DataType.STRING(255)
  },

  amazon: {
    type: DataType.JSON()
  }

},{
    timestamps: false
});


Cart.Items = Cart.hasMany(Item, { as: 'full_items', foreignKey: 'cart_id'});
Item.Cart = Item.belongsTo(Cart, { as: 'item', foreignKey: 'cart_id'});



export default Cart;
