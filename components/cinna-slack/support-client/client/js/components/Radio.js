import React, {Component, PropTypes} from 'react';
import {Radio} from 'react-btn-checkbox';

export default class RadioApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      'First': false,
      'Second': true,
      'Third': false
    }
  }
  render(){
    return (
      <Radio options={this.state} onChange={this.setState.bind(this)} />
    )
  }
}
