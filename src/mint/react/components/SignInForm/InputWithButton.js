import React, { Component, PropTypes } from 'react';

export default class InputWithButton extends Component {
  render() {
    const { input: { value, onChange } } = this.props
    return (
      <div className="custom__input">
        <input className="custom__input__field" onChange={onChange} value={value} type="email" placeholder='Enter your email'/>
        <button className="custom__input__button" type="Submit">Submit</button>
      </div>
    )
  }
}
