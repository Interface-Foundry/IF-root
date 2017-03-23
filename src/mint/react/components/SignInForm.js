import React, { PropTypes, Component } from 'react';

export default class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleEmail = ::this.handleEmail;
  }

  handleEmail(e) {
    this.setState({ email: e.target.value });
  }

  static propTypes = {
    signIn: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired
  }

  render() {
    const { cart_id, signIn } = this.props;
    return (
      <form onSubmit={e => signIn(e, cart_id, this.state.email)}>
        <input required placeholder='Enter your email' name='email' type='email' onChange={this.handleEmail}/>
        <hr/>
        <button type='Submit'>
          Sign Up
        </button>
      </form>
    );
  }
}