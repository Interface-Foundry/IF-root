import React, { PropTypes, Component } from 'react';

export default class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleUrl = this.handleUrl.bind(this);
  }

  handleUrl(e) {
    this.setState({ url: e.target.value });
  }

  render() {
    const { cart_id, addItem } = this.props;
    return (
      <form onSubmit={e => addItem(e, cart_id, this.state.url)}>
        <input required placeholder='Enter the link to an amazon product' name='email' type='url' onChange={this.handleUrl}/>
        <br/>
        <button type='Submit'>
          Add To Cart
        </button>
      </form>
    );
  }
}
