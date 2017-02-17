import DataType from 'sequelize';
import Conn from '../sequelize';
import Item from './Item';

const Cart = Conn.define('cart', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  slack_id: {
    type: DataType.STRING(255)
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
    type: DataType.DATE()
  },

  type: {
    type: DataType.STRING(255)
  },

  link: {
    type: DataType.STRING(255)
  },
  
},{
    timestamps: false
});

// Cart.hasMany(Item);
// Item.belongsTo(Cart);

export default Cart;
