import React, { Component, PropTypes } from 'react';
import { FormControl } from 'react-bootstrap';

export default class TypeFormField extends Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.handleChange = ::this.handleChange;
  }

  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    key: PropTypes.number,
    enabled: PropTypes.bool,
    required: PropTypes.bool,
    action: PropTypes.func
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  render() {
    const { key, placeholder, name, type, enabled = true, required = true, action } = this.props;
    const { value } = this.state;
    return (
      <FormControl key={key} required={required} value={value} onChange={this.handleChange} disabled={!enabled} placeholder={placeholder} name={name} type={type} action={action} />
    );
  }
}
