import React, { PropTypes, Component } from 'react';
import { Form, FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';

export default class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = { email: '' };
    this.handleEmail = ::this.handleEmail;
    this.handleSubmit = ::this.handleSubmit;
  }

  handleEmail(e) {
    this.setState({ email: e.target.value });
  }

  handleSubmit(e) {
    const { props, state } = this;
    const { cart_id, signIn } = props;
    const { email } = state;
    e.preventDefault();
    signIn(cart_id, email);
    this.setState({ email: '' });
  }

  static propTypes = {
    signIn: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired
  }

  render() {
    const { handleSubmit, handleEmail, state } = this;
    const { email } = state;
    return (
      <Form onSubmit={handleSubmit}>
        <FormGroup>
            <InputGroup>
                <FormControl type="email" name='email' value={email} required placeholder='Enter your email' onChange={handleEmail}/>
                <InputGroup.Button >
                    <Button type="submit" bsStyle="primary">Sign Up</Button>
                </InputGroup.Button>
            </InputGroup>
        </FormGroup>
    </Form>
    );
  }
}
