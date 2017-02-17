import DataType from 'sequelize';
import Conn from '../sequelize';

const Item = Conn.define('item', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  cart_id: {
    type:  DataType.STRING(255),
  },

  title: {
    type: DataType.STRING(255)
  },

  image: {
    type: DataType.STRING(255)
  },

  description: {
    type:  DataType.STRING(255)
  },

  price: {
    type: DataType.STRING(255)
  },

  ASIN: {
    type: DataType.STRING(255)
  },

  rating: {
    type: DataType.STRING(255)
  },

  review_count: {
    type: DataType.STRING(255)
  },

  added_by: {
    type: DataType.STRING(255)
  },

  slack_id: {
    type: DataType.STRING(255)
  },

  source_json: {
    type: DataType.STRING(255)
  },

  purchased: {
    type: DataType.BOOLEAN()
  },

  purchased_date: {
    type: DataType.BOOLEAN()
  },

  deleted: {
    type: DataType.BOOLEAN()
  },

  added_date: {
    type: DataType.DATE()
  },

  bundle: {
    type: DataType.STRING(255)
  },

  available: {
    type: DataType.BOOLEAN()
  },

  asins: {
    type: DataType.STRING(255)
  },

  config: {
    type: DataType.STRING(255)
  }

},{
    timestamps: false
});

export default Item;
