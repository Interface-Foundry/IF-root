import React, { PropTypes, Component } from 'react';

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item } = this.props;

    return (
      <a href={item.original_link}>
        <div>
          <h4>{`Item #${item.id} Name: ${item.descrip}`}</h4>
          <div className='image' style={
            {
              backgroundImage: `url(//placehold.it/100x100)`,
              height: 100,
              width: 100
            }}/>
            <p>Qty: {item.quantity}</p>
            <p>Price: ${item.price}</p>
            <button disabled>Edit</button>
        </div>
      </a>
    );
  }
}
