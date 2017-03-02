import DataType from 'sequelize';
import Conn from '../sequelize';
import Delivery from './Delivery';
import Chatuser from './Chatuser';

const Waypoint = Conn.define('waypoint', {

    id: {
       type: DataType.STRING(255)

    },

    delivery_id: {
          type: DataType.STRING(255)
    },

    user_id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV1,
      primaryKey: true,
    },

    waypoint: {
      type: DataType.STRING(255)
    },

    data: {
      type: DataType.STRING(255)
    },

    timestamp: {
      type: DataType.STRING(255)
    }

  }, {
    timestamps: false
  }
);

Waypoint.User = Waypoint.hasOne(Chatuser, { as: 'user', foreignKey: 'user_id'});
Chatuser.Waypoint = Chatuser.belongsTo(Waypoint, { as: 'waypoint', foreignKey: 'user_id'});

export default Waypoint;
