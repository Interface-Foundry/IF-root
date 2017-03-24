import React, { PropTypes, Component } from 'react';
import { Form, FormGroup, InputGroup, FormControl, Button } from 'react-bootstrap';

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
      <Form onSubmit={e => signIn(e, cart_id, this.state.email)}>
        <FormGroup>
            <InputGroup>
                <FormControl type="email" name='email' required placeholder='Enter your email' onChange={this.handleEmail}/>
                <InputGroup.Button >
                    <Button type="submit" bsStyle="primary">Sign Up</Button>
                </InputGroup.Button>
            </InputGroup>
        </FormGroup>
    </Form>
    );
  }
}
