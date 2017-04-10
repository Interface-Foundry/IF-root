import React, { PropTypes, Component } from 'react';

export default class Footer extends Component {

  static propTypes = {
    cart_id: PropTypes.string,
    replace: PropTypes.func.isRequired,
    uniq_id: PropTypes.string,
    addItem: PropTypes.func.isRequired
  }

  render() {
    const { addItem, uniq_id, cart_id, replace } = this.props;
    return (
      <footer className='item__footer'>
        <button onClick={() => addItem(cart_id, uniq_id, replace)}>Add to Cart</button>
      </footer>
    );
  }
}