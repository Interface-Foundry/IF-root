import React, { PropTypes, Component } from 'react';
import { Button, Form, FormGroup, FormControl, ControlLabel, InputGroup } from 'react-bootstrap';

export default class AddAmazonItem extends Component {
  constructor(props) {
    super(props);
    this.state = { url: '' };
    this.handleUrl = ::this.handleUrl;
    this.handleSubmit = ::this.handleSubmit;
  }

  static propTypes = {
    addItem: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired
  }

  handleUrl(e) {
    this.setState({ url: e.target.value });
  }

  handleSubmit(e) {
    const { props, state } = this;
    const { cart_id, addItem } = props;
    const { url } = state;
    e.preventDefault();
    addItem(cart_id, url);
    this.setState({ url: '' });
  }

  render() {
    const { handleSubmit, handleUrl, state } = this;
    const { url } = state;
    return (
      <Form onSubmit={handleSubmit}>
        <FormGroup>
            <ControlLabel>Paste URL from Amazon</ControlLabel>
            <InputGroup>
                <FormControl required placeholder='Enter the link to an amazon product' name='email' type='url' onChange={this.handleUrl} />
                <InputGroup.Button>
                    <Button type='submit' bsStyle="primary">
                      Add To Cart
                    </Button>
                </InputGroup.Button>
            </InputGroup>
        </FormGroup>
      </Form>
    );
  }
}
