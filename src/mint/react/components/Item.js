import React, { PropTypes } from 'react';

const Item = ({ title, quantity }) => (
  <div>
    {title} - {quantity ? ` x ${quantity}` : null}
  </div>
);

Item.propTypes = {
  title: PropTypes.string,
  quantity: PropTypes.number
}

export default Item