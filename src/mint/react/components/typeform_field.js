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
    tfStyle: PropTypes.object,
    enabled: PropTypes.bool,
    required: PropTypes.bool
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  render() {
    const { tfStyle: style, placeholder, name, type, enabled = true, required = true } = this.props;
    const { value } = this.state;
    return (
      <FormControl style={style} required={required} value={value} onChange={this.handleChange} disabled={!enabled} placeholder={placeholder} name={name} type={type} />
    );
  }
}
