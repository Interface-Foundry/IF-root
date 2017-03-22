import React, { PropTypes, Component } from 'react';
import { Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

export default class AddItemField extends Component {
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
      <Form onSubmit={e => addItem(e, cart_id, this.state.url)}>
        <FormGroup>
          <ControlLabel>Amazon URL</ControlLabel>
          <FormControl required placeholder='Enter the link to an amazon product' name='email' type='url' onChange={this.handleUrl} />
        </FormGroup>
        <Button type='submit'>
          Add To Cart
        </Button>
      </Form>
    );
  }
}
