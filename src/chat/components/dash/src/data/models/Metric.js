import DataType from 'sequelize';
import Conn from '../sequelize';

const Metric = Conn.define('metric', {
  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  metric: {
    type: DataType.STRING(255)
  },

  data: {
    type: DataType.STRING(255)
  }

},{
    timestamps: false
});

export default Metric;
